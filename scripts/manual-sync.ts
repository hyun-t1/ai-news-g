import { syncLatestNews } from "@/lib/news-service";

async function main() {
  const result = await syncLatestNews();

  console.log(JSON.stringify({
    savedCount: result.savedCount,
    syncedAt: result.syncedAt,
    collectorStatus: result.collectorStatus,
  }, null, 2));
}

main().catch((error) => {
  console.error("Manual sync failed.");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
