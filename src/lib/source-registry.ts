import { PromotionCandidate, SourceDefinition, UserInterestProfile } from "@/lib/types";

export const defaultSources: SourceDefinition[] = [
  {
    id: "x",
    name: "X",
    domain: "x.com",
    channel: "social",
    tier: "priority",
    rationale: "초기 반응 속도가 빠르고 업계 인사들의 직접 발화가 자주 올라옵니다.",
  },
  {
    id: "github",
    name: "GitHub",
    domain: "github.com",
    channel: "repo",
    tier: "priority",
    rationale: "release, star 급증, changelog 변화를 가장 빨리 포착할 수 있습니다.",
  },
  {
    id: "reddit",
    name: "Reddit",
    domain: "reddit.com",
    channel: "community",
    tier: "priority",
    rationale: "개발자 커뮤니티 반응과 실사용 경험 비교가 활발한 소스입니다.",
  },
  {
    id: "claude",
    name: "Claude",
    domain: "claude.ai",
    channel: "product",
    tier: "priority",
    rationale: "Claude Mythos와 Claude Code 관련 업데이트를 직접 추적하기 좋습니다.",
  },
  {
    id: "codex",
    name: "Codex",
    domain: "openai.com/codex",
    channel: "product",
    tier: "priority",
    rationale: "사용자 관심사와 직결되는 코딩 에이전트 업데이트를 우선 추적합니다.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    domain: "chatgpt.com",
    channel: "product",
    tier: "priority",
    rationale: "OpenAI 제품 공개와 배포 속도를 체감하기 좋은 핵심 채널입니다.",
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
    rationale: "Claude 계열의 릴리스와 연구 발표를 추적하기 위한 핵심 소스입니다.",
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
    rationale: "연구 흐름이 실제 제품으로 이어질 가능성을 확인하기 좋습니다.",
  },
];

export const promotionCandidates: PromotionCandidate[] = [
  {
    id: "firecrawl",
    name: "Firecrawl Blog",
    domain: "firecrawl.dev",
    repeatCount: 6,
    reason: "최근 2주 동안 에이전트 워크플로우 관련 뉴스에서 반복적으로 등장했습니다.",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    domain: "perplexity.ai",
    repeatCount: 5,
    reason: "검색형 AI 제품 비교 문맥에서 꾸준히 언급되고 있습니다.",
  },
  {
    id: "vllm",
    name: "vLLM",
    domain: "github.com/vllm-project",
    repeatCount: 4,
    reason: "추론 인프라와 오픈 모델 배포 흐름에서 영향력이 커지고 있습니다.",
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
