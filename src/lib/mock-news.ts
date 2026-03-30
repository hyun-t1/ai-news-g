import { NewsItem } from "@/lib/types";

export const mockNewsItems: NewsItem[] = [
  {
    id: "news-1",
    sourceId: "anthropic",
    sourceName: "Anthropic",
    url: "https://www.anthropic.com",
    title: "Claude Code team previews a faster workflow bundle for repo-wide edits",
    titleKo: "Claude Code 팀이 저장소 전체 편집용 더 빠른 워크플로 번들을 예고했습니다",
    summary:
      "Anthropic is testing a workflow bundle that reduces context setup time for repeated repository-wide edit tasks and agent handoffs.",
    summaryKo:
      "Anthropic이 반복적인 저장소 전체 수정과 에이전트 핸드오프 작업에서 문맥 준비 시간을 줄여 주는 워크플로 번들을 시험 중입니다.",
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
    titleKo: "Impeccable 스타일 저장소 패턴이 여러 AI 코딩 스타터 킷에 반영되고 있습니다",
    summary:
      "Maintainers are standardizing design-first repo structures for agentic coding tools, and stars are accelerating across related starter kits.",
    summaryKo:
      "유지보수자들이 에이전트 코딩 도구용 디자인 중심 저장소 구조를 표준화하고 있으며, 관련 스타터 킷들의 star 증가 속도도 빨라지고 있습니다.",
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
    titleKo: "Codex 워크스페이스 동기화 개선으로 다단계 패치 검토 지연이 줄어들었습니다",
    summary:
      "OpenAI is rolling out tighter workspace sync controls to reduce review gaps between exploration, edits, and validation in coding flows.",
    summaryKo:
      "OpenAI가 탐색, 수정, 검증 단계 사이의 검토 공백을 줄이기 위해 더 정교한 워크스페이스 동기화 제어를 도입하고 있습니다.",
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
    titleKo: "개발자들이 Claude Mythos 프롬프트 동작을 최신 코딩 에이전트들과 비교하고 있습니다",
    summary:
      "A large Reddit thread is surfacing practical differences in planning style, edit reliability, and review behavior across top AI coding assistants.",
    summaryKo:
      "대형 Reddit 스레드에서 주요 AI 코딩 어시스턴트들의 계획 방식, 수정 신뢰성, 코드 리뷰 성향 차이가 구체적으로 정리되고 있습니다.",
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
    sourceId: "x",
    sourceName: "X",
    url: "https://x.com",
    title: "Multiple researchers flag a sudden spike in small multimodal model demos",
    titleKo: "여러 연구자들이 소형 멀티모달 모델 데모의 급증을 지적했습니다",
    summary:
      "Short-form demos on X suggest that lightweight multimodal stacks are getting good enough for on-device assistants and quick UI copilots.",
    summaryKo:
      "X의 짧은 데모들로 볼 때 경량 멀티모달 스택이 온디바이스 어시스턴트와 UI 코파일럿 용도로 충분히 실용화 단계에 가까워지고 있습니다.",
    publishedAt: "2026-03-31T12:25:00+09:00",
    lastUpdatedAt: "2026-03-31T12:49:00+09:00",
    engagement: {
      likes: 3490,
      comments: 420,
      velocity: 121,
    },
    crossSignalCount: 4,
    tags: ["X", "Multimodal", "Research"],
    userInterest: "hold",
  },
  {
    id: "news-6",
    sourceId: "chatgpt",
    sourceName: "ChatGPT",
    url: "https://chatgpt.com",
    title: "Shared team memory controls are being tested for faster recurring task setup",
    titleKo: "반복 업무 설정을 빠르게 하는 공유 팀 메모리 제어 기능이 시험 중입니다",
    summary:
      "Early testers report that reusable memory profiles could shorten setup for repeated workflows across writing, planning, and coding tasks.",
    summaryKo:
      "초기 테스트에 따르면 재사용 가능한 메모리 프로필이 글쓰기, 기획, 코딩 반복 워크플로의 설정 시간을 줄여 줄 수 있습니다.",
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
  {
    id: "news-7",
    sourceId: "github",
    sourceName: "GitHub",
    url: "https://github.com",
    title: "Open-source eval dashboards gain traction as teams compare agent reliability",
    titleKo: "팀들이 에이전트 신뢰성을 비교하기 위해 오픈소스 평가 대시보드를 적극 도입하고 있습니다",
    summary:
      "Several evaluation dashboard repositories have crossed new star milestones as teams look for reproducible ways to compare coding agents.",
    summaryKo:
      "여러 평가 대시보드 저장소가 새로운 star 이정표를 넘기며, 팀들이 코딩 에이전트를 재현 가능하게 비교하려는 흐름이 강해지고 있습니다.",
    publishedAt: "2026-03-28T14:20:00+09:00",
    lastUpdatedAt: "2026-03-31T10:15:00+09:00",
    engagement: {
      likes: 790,
      comments: 92,
      stars: 910,
      velocity: 28,
    },
    crossSignalCount: 5,
    tags: ["GitHub", "Evaluation", "Agent"],
    userInterest: "reference",
  },
  {
    id: "news-8",
    sourceId: "openai",
    sourceName: "OpenAI",
    url: "https://openai.com",
    title: "Developers discuss when larger reasoning budgets actually help code review",
    titleKo: "개발자들이 더 큰 추론 예산이 실제로 코드 리뷰에 도움이 되는 시점을 논의하고 있습니다",
    summary:
      "Discussion is shifting from raw benchmark gains to when deeper reasoning effort is worth the latency in day-to-day engineering work.",
    summaryKo:
      "논의의 초점이 단순 벤치마크 향상에서, 일상적인 엔지니어링 업무에서 더 깊은 추론이 지연을 감수할 만큼 가치가 있는지로 옮겨가고 있습니다.",
    publishedAt: "2026-03-29T20:00:00+09:00",
    lastUpdatedAt: "2026-03-31T11:25:00+09:00",
    engagement: {
      likes: 1340,
      comments: 210,
      velocity: 41,
    },
    crossSignalCount: 4,
    tags: ["OpenAI", "Reasoning", "Code Review"],
    userInterest: "interested",
  },
];
