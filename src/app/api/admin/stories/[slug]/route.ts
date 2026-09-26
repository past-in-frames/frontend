import { proxyAdmin } from "@/lib/admin-proxy";

type StoryRoute = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: StoryRoute) {
  const { slug } = await params;
  return proxyAdmin(`/api/admin/stories/${encodeURIComponent(slug)}`);
}

export async function PUT(request: Request, { params }: StoryRoute) {
  const { slug } = await params;
  return proxyAdmin(`/api/admin/stories/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: await request.text(),
  });
}

export async function DELETE(_request: Request, { params }: StoryRoute) {
  const { slug } = await params;
  return proxyAdmin(`/api/admin/stories/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}
