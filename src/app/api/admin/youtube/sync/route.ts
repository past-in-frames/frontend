import { proxyAdmin } from "@/lib/admin-proxy";

export async function POST() {
  return proxyAdmin("/api/admin/youtube/sync", { method: "POST" });
}
