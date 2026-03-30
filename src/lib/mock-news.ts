import { NewsItem } from "@/lib/types";

export const mockNewsItems: NewsItem[] = [
  {
    id: "news-1",
    sourceId: "anthropic",
    sourceName: "Anthropic",
    url: "https://www.anthropic.com",
    title: "Claude Code team previews a faster workflow bundle for repo-wide edits",
    titleKo: "Claude Code 팀이 저장소 전체 수정에 특화된 더 빠른 워크플로 번들을 예고했습니다",
    summary:
      "Anthropic is testing a workflow bundle that reduces context setup time for repeated repository-wide edit tasks and agent handoffs.",
    summaryKo:
      "Anthropic은 반복적인 저장소 전체 수정과 에이전트 핸드오프 작업에서 문맥 준비 시간을 줄이는 새 워크플로 번들을 시험 중입니다.",
    publishedAt: "2026-03-31T12:18:00+09:00",
    lastUpdatedAt: "2026-03-31T12:46:00+09:00",
    engagement: {
      likes: 1820,
      comments: 284,
      velocity: 96,
    },
    crossSignalCount: 7,
    tags: ["Claude Code", "Anthropic", "Agent Workflow"],
    userInterest: "interested",
  },
  {
    id: "news-2",
    sourceId: "github",
    sourceName: "GitHub",
    url: "https://github.com",
    title: "Impeccable-inspired repo patterns appear in several AI coding starter kits",
    titleKo: "Impeccable 스타일 저장소 패턴이 여러 AI 코딩 스타터킷에 반영되고 있습니다",
    summary:
      "Maintainers are standardizing design-first repo structures for agentic coding tools, and stars are accelerating across related starter kits.",
    summaryKo:
      "유지보수자들이 에이전트형 코딩 도구를 위한 디자인 중심 저장소 구조를 표준화하고 있으며, 관련 스타터킷의 star 증가 속도도 빨라지고 있습니다.",
    publishedAt: "2026-03-31T11:52:00+09:00",
    lastUpdatedAt: "2026-03-31T12:32:00+09:00",
    engagement: {
      likes: 930,
      comments: 116,
      stars: 640,
      velocity: 82,
    },
    crossSignalCount: 5,
    tags: ["GitHub", "Impeccable", "Starter Kit"],
    userInterest: "reference",
  },
  {
    id: "news-3",
    sourceId: "openai",
    sourceName: "OpenAI",
    url: "https://openai.com",
    title: "Codex workspace sync improvements reduce review lag for multi-step patches",
    titleKo: "Codex 워크스페이스 동기화 개선으로 여러 단계 패치의 리뷰 지연이 줄어들었습니다",
    summary:
      "OpenAI is rolling out tighter workspace sync controls to reduce review gaps between exploration, edits, and validation in coding flows.",
    summaryKo:
      "OpenAI는 탐색, 수정, 검증 단계 사이의 리뷰 공백을 줄이기 위해 더 정교한 워크스페이스 동기화 제어를 적용하고 있습니다.",
    publishedAt: "2026-03-31T12:06:00+09:00",
    lastUpdatedAt: "2026-03-31T12:42:00+09:00",
    engagement: {
      likes: 2100,
      comments: 334,
      velocity: 104,
    },
    crossSignalCount: 8,
    tags: ["Codex", "OpenAI", "Workspace"],
    userInterest: "breakthrough",
  },
  {
    id: "news-4",
    sourceId: "reddit",
    sourceName: "Reddit",
    url: "https://www.reddit.com",
    title: "Developers compare Claude Mythos prompt behavior against newer coding agents",
    titleKo: "개발자들이 Claude Mythos 프롬프트 동작을 최신 코딩 에이전트와 비교하고 있습니다",
    summary:
      "A large Reddit thread is surfacing practical differences in planning style, edit reliability, and review behavior across top AI coding assistants.",
    summaryKo:
      "대형 Reddit 스레드에서 주요 AI 코딩 도우미들의 계획 방식, 수정 안정성, 코드 리뷰 성향 차이가 구체적으로 정리되고 있습니다.",
    publishedAt: "2026-03-31T09:10:00+09:00",
    lastUpdatedAt: "2026-03-31T12:08:00+09:00",
    engagement: {
      likes: 1560,
      comments: 602,
      velocity: 66,
    },
    crossSignalCount: 6,
    tags: ["Claude Mythos", "Reddit", "Agent Benchmark"],
    userInterest: "interested",
  },
  {
    id: "news-5",
    sourceId: "chatgpt",
    sourceName: "ChatGPT",
    url: "https://chatgpt.com",
    title: "Shared team memory controls are being tested for faster recurring task setup",
    titleKo: "반복 업무 설정을 더 빠르게 만드는 공유 팀 메모리 제어 기능이 시험 중입니다",
    summary:
      "Early testers report that reusable memory profiles could shorten setup for repeated workflows across writing, planning, and coding tasks.",
    summaryKo:
      "초기 사용자들에 따르면 재사용 가능한 메모리 프로필이 글쓰기, 기획, 코딩 작업의 반복 워크플로 설정 시간을 크게 줄여줄 수 있습니다.",
    publishedAt: "2026-03-30T18:40:00+09:00",
    lastUpdatedAt: "2026-03-31T08:10:00+09:00",
    engagement: {
      likes: 1180,
      comments: 145,
      velocity: 38,
    },
    crossSignalCount: 3,
    tags: ["ChatGPT", "Memory", "Workflow"],
    userInterest: "reference",
  },
];
