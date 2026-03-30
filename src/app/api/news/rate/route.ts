import { recordInterestChange } from "@/lib/news-repository";
import { InterestLevel } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    newsItemId?: string;
    nextLevel?: InterestLevel;
  };

  if (!body.newsItemId || !body.nextLevel) {
    return Response.json(
      {
        ok: false,
        message: "newsItemId 와 nextLevel 이 필요합니다.",
      },
      { status: 400 },
    );
  }

  const result = await recordInterestChange(body.newsItemId, body.nextLevel);

  return Response.json({
    ok: true,
    persisted: Boolean(result),
    result,
  });
}
