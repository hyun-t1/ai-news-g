# AI News Radar

전 세계 AI 뉴스를 수집하고, 한국어 요약으로 읽고, 개인 관심도로 아카이빙하는 `Next.js + Supabase` 기반 앱입니다.

## 포함 기능

- 실시간 핵심 뉴스
- 오늘의 하이라이트
- 최신순 `New Feed`
- 날짜 필터
- 검색
- 관심도 5단계 아카이빙
- 관심도 변경 시간 기록
- 최우선 소스 관리
- 공개 소스 실수집
- Supabase 저장

## 현재 수집 소스

- OpenAI 공식 RSS
- Anthropic sitemap 기반 news / research / engineering
- GitHub releases / repo 업데이트
- Reddit 공개 subreddit 새 글

## 동작 방식

1. Supabase 저장 데이터가 있으면 그 데이터를 우선 보여줍니다.
2. 저장 데이터가 없으면 공개 소스를 실시간으로 수집합니다.
3. `OPENAI_API_KEY` 가 있으면 한국어 제목/요약을 생성합니다.
4. `CRON_SECRET` 이 있으면 `/api/news/sync` 는 인증된 요청만 허용합니다.

## 주요 API

- `GET /api/news/sync`
  - Vercel Cron 자동 호출용
- `POST /api/news/sync`
  - 개발 중 수동 동기화용
- `POST /api/news/rate`
  - 뉴스 관심도 변경 저장

## 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `CRON_SECRET`
- `OPENAI_TRANSLATION_MODEL`
- `OPENAI_TRANSLATION_LIMIT`
- `GITHUB_TOKEN`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `X_BEARER_TOKEN`

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

## Supabase 적용

[schema.sql](C:/codex/AI_news/supabase/schema.sql#L1) 을 Supabase SQL Editor 에서 실행하면 됩니다.

## 배포

Vercel Cron 설정과 Supabase 연결까지 포함한 상세 순서는 [DEPLOY_KO.md](C:/codex/AI_news/docs/DEPLOY_KO.md#L1) 에 정리했습니다.

주의:

- 기본 [vercel.json](C:/codex/AI_news/vercel.json#L1) 은 첫 배포 실패를 막기 위해 Hobby 플랜 기준 하루 1회 스케줄로 넣어 두었습니다.
- 더 자주 수집하려면 Pro 플랜 이상에서 cron expression 을 높이거나 외부 스케줄러를 연결하세요.
