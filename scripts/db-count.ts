import { createSupabaseServerClient } from "@/lib/supabase/server";

async function countTable(table: string) {
  const client = createSupabaseServerClient();

  if (!client) {
    throw new Error("Supabase environment variables are missing.");
  }

  const { count, error } = await client
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function main() {
  const newsItems = await countTable("news_items");
  const newsSources = await countTable("news_sources");
  const interestEvents = await countTable("user_interest_events");

  console.log(JSON.stringify({
    news_items: newsItems,
    news_sources: newsSources,
    user_interest_events: interestEvents,
  }, null, 2));
}

main().catch((error) => {
  console.error("Database count failed.");
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
