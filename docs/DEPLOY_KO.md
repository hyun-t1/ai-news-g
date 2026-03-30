# AI News Radar 배포 가이드

처음 배포하는 분 기준으로 순서대로 설명합니다.

## 1. 필요한 계정

- GitHub
- Vercel
- Supabase
- OpenAI API

선택:

- GitHub Personal Access Token
- X API Bearer Token

## 2. Supabase 준비

1. Supabase에서 새 프로젝트를 만듭니다.
2. `SQL Editor` 로 이동합니다.
3. [schema.sql](C:/codex/AI_news/supabase/schema.sql#L1) 내용을 실행합니다.
4. 아래 값을 복사해 둡니다.

- `Project URL`
- `anon public key`
- `service_role key`

## 3. OpenAI API 키 준비

1. [OpenAI API Keys](https://platform.openai.com/api-keys) 에서 키를 만듭니다.
2. 이 키는 영어 뉴스를 한국어 제목/요약으로 바꾸는 데 사용됩니다.
3. 키가 없어도 앱은 동작하지만 번역 품질은 떨어집니다.

## 4. GitHub에 코드 올리기

```bash
git init
git add .
git commit -m "Initial AI News Radar"
git branch -M main
git remote add origin <내 저장소 주소>
git push -u origin main
```

## 5. Vercel 배포

1. Vercel에서 `Add New -> Project` 를 누릅니다.
2. GitHub 저장소를 연결합니다.
3. Framework는 `Next.js` 로 자동 인식되는지 확인합니다.
4. 환경 변수를 입력합니다.

필수:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`

권장:

- `OPENAI_API_KEY`
- `OPENAI_TRANSLATION_MODEL`
- `OPENAI_TRANSLATION_LIMIT`
- `GITHUB_TOKEN`

## 6. CRON_SECRET 꼭 넣기

이 프로젝트는 `/api/news/sync` 요청 시 `Authorization: Bearer <CRON_SECRET>` 형식의 인증을 검사합니다.

운영 배포에서는:

- 브라우저 수동 버튼보다
- Vercel Cron 자동 호출을 기준으로 운영하는 것이 더 안전합니다.

## 7. 자동 수집 스케줄

[vercel.json](C:/codex/AI_news/vercel.json#L1) 에 30분 간격 스케줄이 들어 있습니다.

- 기본값은 `0 0 * * *`
- 의미: UTC 기준 하루 1회 실행

이 기본값으로 둔 이유:

- Vercel 공식 문서의 2026년 1월 28일 업데이트 기준으로
- `Hobby` 플랜은 하루 1회만 Cron 실행이 허용됩니다
- 더 자주 설정하면 배포가 실패할 수 있습니다

만약 `Pro` 이상 플랜이라면 아래처럼 바꿔도 됩니다.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/news/sync",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

한국 시간은 UTC+9 입니다.
예를 들어 `0 0 * * *` 는 한국 시간 오전 9시쯤 실행됩니다.

## 8. 배포 후 확인

1. 메인 페이지가 열리는지 확인합니다.
2. 상단에 `실데이터 동기화 상태` 패널이 보이는지 확인합니다.
3. Vercel 프로젝트의 `Settings -> Cron Jobs` 에서 `/api/news/sync` 가 등록되었는지 확인합니다.
4. 30분 뒤 Supabase `news_items` 테이블에 데이터가 들어오는지 확인합니다.

## 9. 지금 구조에서 실제 동작 흐름

1. Vercel Cron 이 `/api/news/sync` 를 호출합니다.
2. 앱이 공개 소스를 수집합니다.
3. OpenAI 키가 있으면 한국어 제목/요약을 생성합니다.
4. Supabase `news_items` 에 저장합니다.
5. 메인 페이지는 저장된 데이터를 우선 읽습니다.
6. 사용자가 관심도를 바꾸면 이벤트 로그가 쌓입니다.

## 10. 첫 배포 후 추천 확인 순서

1. Supabase 스키마 적용
2. Vercel 환경 변수 입력
3. 첫 프로덕션 배포
4. Cron 등록 확인
5. 데이터 유입 확인
6. 관심도 클릭 후 `user_interest_events` 증가 확인

## 11. 다음 추천 작업

1. X API 연결
2. 소스 승격/강등 DB 영속화
3. 관리자 보호
4. 추천 알고리즘 고도화
5. 번역 비용 제어

## 참고한 공식 문서

- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Vercel Managing Cron Jobs](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
