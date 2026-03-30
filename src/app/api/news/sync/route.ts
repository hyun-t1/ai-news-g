import { revalidatePath } from "next/cache";
import { syncLatestNews } from "@/lib/news-service";
import { isAuthorizedSyncRequest } from "@/lib/sync-auth";

async function runSync(request: Request) {
  if (!isAuthorizedSyncRequest(request)) {
    return Response.json(
      {
        ok: false,
        message: "Unauthorized sync request",
      },
      { status: 401 },
    );
  }

  const result = await syncLatestNews();
  revalidatePath("/");

  return Response.json({
    ok: true,
    savedCount: result.savedCount,
    syncedAt: result.syncedAt,
    collectorStatus: result.collectorStatus,
    itemCount: result.fallbackItems.length,
  });
}

export async function GET(request: Request) {
  return runSync(request);
}

export async function POST(request: Request) {
  return runSync(request);
}
