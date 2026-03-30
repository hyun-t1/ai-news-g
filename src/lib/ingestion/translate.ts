import { CollectedNewsItem } from "@/lib/types";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export async function translateCollectedNews(items: CollectedNewsItem[]) {
  if (!process.env.OPENAI_API_KEY) {
    return items.map((item) => ({
      ...item,
      titleKo: item.title,
      summaryKo: item.summary,
    }));
  }

  const limit = Number(process.env.OPENAI_TRANSLATION_LIMIT ?? "12");
  const concurrency = Number(process.env.OPENAI_TRANSLATION_CONCURRENCY ?? "4");
  const translatable = items.slice(0, limit);
  const overflow = items.slice(limit).map((item) => ({
    ...item,
    titleKo: item.title,
    summaryKo: item.summary,
  }));

  const translated: CollectedNewsItem[] = [];

  for (let start = 0; start < translatable.length; start += concurrency) {
    const chunk = translatable.slice(start, start + concurrency);
    const results = await Promise.all(
      chunk.map(async (item) => {
        const translatedItem = await translateOne(item).catch(() => ({
          titleKo: item.title,
          summaryKo: item.summary,
        }));

        return {
          ...item,
          ...translatedItem,
        };
      }),
    );

    translated.push(...results);
  }

  return [...translated, ...overflow];
}

async function translateOne(item: CollectedNewsItem) {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-5",
      input: [
        {
          role: "system",
          content:
            "You translate AI news into Korean for a single-user dashboard. Return strict JSON only.",
        },
        {
          role: "user",
          content: `Translate the following title and summary into natural Korean. Keep product names in English when helpful. Return JSON with keys titleKo and summaryKo.\n\nTitle: ${item.title}\nSummary: ${item.summary}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "translated_news",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              titleKo: { type: "string" },
              summaryKo: { type: "string" },
            },
            required: ["titleKo", "summaryKo"],
          },
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI translation failed (${response.status})`);
  }

  const json = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  const content =
    json.output_text ??
    json.output?.flatMap((item) => item.content ?? []).map((item) => item.text ?? "").join("") ??
    "";

  const parsed = JSON.parse(content) as {
    titleKo: string;
    summaryKo: string;
  };

  return parsed;
}
