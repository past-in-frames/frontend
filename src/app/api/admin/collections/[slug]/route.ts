import { proxyAdmin } from "@/lib/admin-proxy";

type CollectionRoute = { params: Promise<{ slug: string }> };

export async function PUT(request: Request, { params }: CollectionRoute) {
  const { slug } = await params;
  return proxyAdmin(`/api/admin/collections/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: await request.text(),
  });
}

export async function DELETE(_request: Request, { params }: CollectionRoute) {
  const { slug } = await params;
  return proxyAdmin(`/api/admin/collections/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}
