import { PromotionCandidate, SourceDefinition, UserInterestProfile } from "@/lib/types";

export const defaultSources: SourceDefinition[] = [
  {
    id: "x",
    name: "X",
    domain: "x.com",
    channel: "social",
    tier: "priority",
    rationale: "초기 반응 속도가 가장 빠르고 AI 인사들의 직접 발화가 많습니다.",
  },
  {
    id: "github",
    name: "GitHub",
    domain: "github.com",
    channel: "repo",
    tier: "priority",
    rationale: "release, star 급증, changelog를 가장 신뢰성 있게 포착할 수 있습니다.",
  },
  {
    id: "reddit",
    name: "Reddit",
    domain: "reddit.com",
    channel: "community",
    tier: "priority",
    rationale: "개발자 커뮤니티 반응과 실사용 후기의 밀도가 높습니다.",
  },
  {
    id: "claude",
    name: "Claude",
    domain: "claude.ai",
    channel: "product",
    tier: "priority",
    rationale: "Claude Mythos, Claude Code 등 직접 제품 업데이트 트래킹에 중요합니다.",
  },
  {
    id: "codex",
    name: "Codex",
    domain: "openai.com/codex",
    channel: "product",
    tier: "priority",
    rationale: "사용자 관심사에 직접 연결되는 코딩 에이전트 업데이트 우선 추적 소스입니다.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    domain: "chatgpt.com",
    channel: "product",
    tier: "priority",
    rationale: "OpenAI 제품 전개와 배포 속도를 체감하기 좋은 핵심 채널입니다.",
  },
  {
    id: "openai",
    name: "OpenAI",
    domain: "openai.com",
    channel: "lab",
    tier: "priority",
    rationale: "모델, API, 제품 출시가 집중되는 메인 소스입니다.",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    domain: "anthropic.com",
    channel: "lab",
    tier: "priority",
    rationale: "Claude 계열의 주요 릴리스와 연구 아티클을 추적합니다.",
  },
  {
    id: "hugging-face",
    name: "Hugging Face",
    domain: "huggingface.co",
    channel: "community",
    tier: "watchlist",
    rationale: "오픈 모델과 데모 반응을 빠르게 볼 수 있는 보조 소스입니다.",
  },
  {
    id: "arxiv",
    name: "arXiv",
    domain: "arxiv.org",
    channel: "research",
    tier: "watchlist",
    rationale: "연구 움직임이 실제 제품화로 이어질 가능성을 점검합니다.",
  },
];

export const promotionCandidates: PromotionCandidate[] = [
  {
    id: "firecrawl",
    name: "Firecrawl Blog",
    domain: "firecrawl.dev",
    repeatCount: 6,
    reason: "최근 14일 동안 AI 에이전트 인프라 관련 이슈에서 반복 노출",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    domain: "perplexity.ai",
    repeatCount: 5,
    reason: "검색형 제품 전개와 OpenAI/Anthropic 비교 문맥에서 빈도 상승",
  },
  {
    id: "vllm",
    name: "vLLM",
    domain: "github.com/vllm-project",
    repeatCount: 4,
    reason: "오픈소스 배포 및 inference 생태계 영향도가 높아지고 있음",
  },
];

export const seedProfile: UserInterestProfile = {
  keywords: [
    "claude mythos",
    "impeccable",
    "codex",
    "claude code",
    "anthropic",
    "agent",
  ],
  preferredSources: ["claude", "codex", "github", "anthropic", "openai"],
};
