import { Dashboard } from "@/components/dashboard";
import { getDashboardPayload } from "@/lib/news-service";

export const revalidate = 1800;

export default async function Home() {
  const data = await getDashboardPayload();
  return <Dashboard initialData={data} />;
}
