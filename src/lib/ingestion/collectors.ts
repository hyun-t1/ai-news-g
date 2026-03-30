import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { CollectedNewsItem, CollectorStatus } from "@/lib/types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

const requestHeaders: Record<string, string> = {
  "User-Agent": "ai-news-radar/0.2 (+https://vercel.com)",
};

const githubRepos = [
  "openai/openai-node",
  "anthropics/anthropic-sdk-typescript",
  "huggingface/transformers",
  "vllm-project/vllm",
  "microsoft/autogen",
];

const redditSubreddits = ["artificial", "LocalLLaMA", "OpenAI"];
const redditKeywords = [
  "openai",
  "chatgpt",
  "codex",
  "anthropic",
  "claude",
  "agent",
  "gpt",
];

type CollectorResult = {
  items: CollectedNewsItem[];
  status: CollectorStatus;
};

export async function collectLatestNews() {
  const tasks = [
    collectOpenAiNews(),
    collectAnthropicNews(),
    collectGitHubNews(),
    collectRedditNews(),
  ];

  const settled = await Promise.allSettled(tasks);
  const items: CollectedNewsItem[] = [];
  const collectorStatus: CollectorStatus[] = [];

  for (const result of settled) {
    if (result.status === "fulfilled") {
      items.push(...result.value.items);
      collectorStatus.push(result.value.status);
      continue;
    }

    collectorStatus.push({
      slug: `collector-${collectorStatus.length + 1}`,
      label: "수집 실패",
      collected: 0,
      note: result.reason instanceof Error ? result.reason.message : "알 수 없는 오류",
    });
  }

  return {
    items: dedupeByUrl(items).sort(sortByFreshness).slice(0, 40),
    collectorStatus,
  };
}

async function collectOpenAiNews(): Promise<CollectorResult> {
  const xml = await fetchText("https://openai.com/news/rss.xml");
  const parsed = parser.parse(xml) as {
    rss?: {
      channel?: {
        item?: Array<{
          title?: string;
          description?: string;
          link?: string;
          guid?: string;
          category?: string | string[];
          pubDate?: string;
        }> | {
          title?: string;
          description?: string;
          link?: string;
          guid?: string;
          category?: string | string[];
          pubDate?: string;
        };
      };
    };
  };

  const items = ensureArray(parsed.rss?.channel?.item)
    .slice(0, 12)
    .map((item) => {
      const publishedAt = toIsoString(item.pubDate);

      return {
        externalId: item.guid ?? item.link ?? item.title ?? crypto.randomUUID(),
        sourceSlug: "openai",
        sourceName: "OpenAI",
        url: item.link ?? "https://openai.com/news",
        title: stripCdata(item.title ?? "OpenAI update"),
        summary: stripCdata(item.description ?? "OpenAI 공식 뉴스 업데이트"),
        publishedAt,
        lastUpdatedAt: publishedAt,
        tags: ["OpenAI", ...ensureArray(item.category).slice(0, 2)],
        engagement: {
          likes: 0,
          comments: 0,
          velocity: velocityFromDate(publishedAt, 96),
        },
        crossSignalCount: 3,
      } satisfies CollectedNewsItem;
    });

  return {
    items,
    status: {
      slug: "openai",
      label: "OpenAI RSS",
      collected: items.length,
      note: "공식 OpenAI 뉴스 RSS",
    },
  };
}

async function collectAnthropicNews(): Promise<CollectorResult> {
  const xml = await fetchText("https://www.anthropic.com/sitemap.xml");
  const parsed = parser.parse(xml) as {
    urlset?: {
      url?: Array<{ loc?: string; lastmod?: string }> | { loc?: string; lastmod?: string };
    };
  };

  const sitemapUrls = ensureArray(parsed.urlset?.url)
    .filter((entry) => {
      const loc = entry.loc ?? "";
      return (
        loc.includes("/news/") ||
        loc.includes("/research/") ||
        loc.includes("/engineering/")
      );
    })
    .sort((a, b) => new Date(b.lastmod ?? 0).getTime() - new Date(a.lastmod ?? 0).getTime())
    .slice(0, 10);

  const pageSettled = await Promise.allSettled(
    sitemapUrls.map(async (entry) => {
      const page = await fetchText(entry.loc ?? "https://www.anthropic.com/news");
      const $ = load(page);
      const title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").first().text() ||
        titleFromUrl(entry.loc ?? "");
      const summary =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "Anthropic 공식 업데이트";
      const publishedAt =
        $('meta[property="article:published_time"]').attr("content") ||
        $('meta[property="og:updated_time"]').attr("content") ||
        entry.lastmod ||
        new Date().toISOString();

      return {
        externalId: entry.loc ?? crypto.randomUUID(),
        sourceSlug: "anthropic",
        sourceName: "Anthropic",
        url: entry.loc ?? "https://www.anthropic.com/news",
        title: cleanText(title),
        summary: cleanText(summary),
        publishedAt: toIsoString(publishedAt),
        lastUpdatedAt: toIsoString(entry.lastmod ?? publishedAt),
        tags: buildAnthropicTags(entry.loc ?? "", title),
        engagement: {
          likes: 0,
          comments: 0,
          velocity: velocityFromDate(entry.lastmod ?? publishedAt, 88),
        },
        crossSignalCount: 2,
      } satisfies CollectedNewsItem;
    }),
  );

  const items = pageSettled
    .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  return {
    items,
    status: {
      slug: "anthropic",
      label: "Anthropic sitemap",
      collected: items.length,
      note: "news / research / engineering 페이지 기반",
    },
  };
}

async function collectGitHubNews(): Promise<CollectorResult> {
  const githubHeaders = {
    ...requestHeaders,
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };

  const settled = await Promise.allSettled(
    githubRepos.map(async (repo) => {
      const [repoResponse, releasesResponse] = await Promise.all([
        fetchJson<{
          full_name: string;
          description: string | null;
          stargazers_count: number;
          updated_at: string;
          html_url: string;
        }>(`https://api.github.com/repos/${repo}`, githubHeaders),
        fetchJson<
          Array<{
            id: number;
            name: string | null;
            tag_name: string | null;
            body: string | null;
            html_url: string;
            published_at: string | null;
          }>
        >(`https://api.github.com/repos/${repo}/releases?per_page=1`, githubHeaders),
      ]);

      const latestRelease = releasesResponse[0];
      const publishedAt =
        latestRelease?.published_at ?? repoResponse.updated_at ?? new Date().toISOString();
      const title = latestRelease?.name || latestRelease?.tag_name
        ? `${repoResponse.full_name} released ${latestRelease?.name ?? latestRelease?.tag_name}`
        : `${repoResponse.full_name} repository update`;
      const summary =
        cleanText(latestRelease?.body ?? repoResponse.description ?? "GitHub repository update") ||
        "GitHub repository update";

      return {
        externalId: latestRelease
          ? `${repoResponse.full_name}-${latestRelease.id}`
          : repoResponse.full_name,
        sourceSlug: "github",
        sourceName: "GitHub",
        url: latestRelease?.html_url ?? repoResponse.html_url,
        title,
        summary: truncate(summary, 260),
        publishedAt: toIsoString(publishedAt),
        lastUpdatedAt: toIsoString(repoResponse.updated_at),
        tags: ["GitHub", ...repoResponse.full_name.split("/")],
        engagement: {
          likes: 0,
          comments: 0,
          stars: repoResponse.stargazers_count,
          velocity: velocityFromDate(repoResponse.updated_at, 74),
        },
        crossSignalCount: 2,
      } satisfies CollectedNewsItem;
    }),
  );

  const items = settled
    .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));

  return {
    items,
    status: {
      slug: "github",
      label: "GitHub releases",
      collected: items.length,
      note: process.env.GITHUB_TOKEN
        ? "토큰 기반 GitHub API"
        : "무토큰 GitHub API (rate limit 낮음)",
    },
  };
}

async function collectRedditNews(): Promise<CollectorResult> {
  const subredditSettled = await Promise.allSettled(
    redditSubreddits.map(async (subreddit) => {
      const response = await fetchJson<{
        data?: {
          children?: Array<{
            data?: {
              id: string;
              title: string;
              selftext: string;
              permalink: string;
              created_utc: number;
              ups: number;
              num_comments: number;
            };
          }>;
        };
      }>(
        `https://www.reddit.com/r/${subreddit}/new.json?limit=12`,
        requestHeaders,
      );

      const posts = ensureArray(response.data?.children)
        .map((entry) => entry.data)
        .filter((post): post is NonNullable<typeof post> => Boolean(post))
        .filter((post) => containsKeyword(post.title, redditKeywords))
        .slice(0, 5)
        .map((post) => {
          const publishedAt = new Date(post.created_utc * 1000).toISOString();

          return {
            externalId: post.id,
            sourceSlug: "reddit",
            sourceName: "Reddit",
            url: `https://www.reddit.com${post.permalink}`,
            title: post.title,
            summary: truncate(post.selftext || post.title, 220),
            publishedAt,
            lastUpdatedAt: publishedAt,
            tags: ["Reddit", `r/${subreddit}`],
            engagement: {
              likes: post.ups,
              comments: post.num_comments,
              velocity: Math.min(99, Math.round(post.ups / 12 + post.num_comments / 3)),
            },
            crossSignalCount: 1,
          } satisfies CollectedNewsItem;
        });

      return posts;
    }),
  );

  const items = subredditSettled
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []));

  return {
    items,
    status: {
      slug: "reddit",
      label: "Reddit new posts",
      collected: items.length,
      note: "공개 subreddit 새 글 기반",
    },
  };
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: requestHeaders,
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`${url} 요청 실패 (${response.status})`);
  }

  return response.text();
}

async function fetchJson<T>(url: string, headers: Record<string, string>) {
  const response = await fetch(url, {
    headers,
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`${url} 요청 실패 (${response.status})`);
  }

  return (await response.json()) as T;
}

function ensureArray<T>(value: T | T[] | undefined | null) {
  if (!value) {
    return [] as T[];
  }

  return Array.isArray(value) ? value : [value];
}

function stripCdata(value: string) {
  return value.replace("<![CDATA[", "").replace("]]>", "").trim();
}

function toIsoString(value: string | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function velocityFromDate(value: string, maxVelocity: number) {
  const hoursAgo = Math.max(
    0,
    (Date.now() - new Date(value).getTime()) / (1000 * 60 * 60),
  );

  return Math.max(12, Math.round(maxVelocity - hoursAgo * 2.6));
}

function titleFromUrl(url: string) {
  const lastSegment = url.split("/").filter(Boolean).at(-1) ?? "update";
  return lastSegment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildAnthropicTags(url: string, title: string) {
  const tags = ["Anthropic"];

  if (url.includes("/news/")) {
    tags.push("News");
  }

  if (url.includes("/research/")) {
    tags.push("Research");
  }

  if (url.includes("/engineering/")) {
    tags.push("Engineering");
  }

  if (/claude|cod(e|ex)/i.test(title)) {
    tags.push("Claude");
  }

  return tags;
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number) {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}…`;
}

function containsKeyword(title: string, keywords: string[]) {
  const lower = title.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function dedupeByUrl(items: CollectedNewsItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }

    seen.add(item.url);
    return true;
  });
}

function sortByFreshness(a: CollectedNewsItem, b: CollectedNewsItem) {
  return (
    new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
  );
}
