import { proxyAdmin } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  return proxyAdmin("/api/admin/stories", {
    method: "POST",
    body: await request.text(),
  });
}
