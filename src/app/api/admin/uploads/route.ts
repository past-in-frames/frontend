import { cookies } from "next/headers";
import { apiOrigin } from "@/lib/api";

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) {
    return Response.json({ message: "Not signed in" }, { status: 401 });
  }

  const incoming = await request.formData();
  const file = incoming.get("file");
  if (!(file instanceof File) || file.size < 1) {
    return Response.json({ message: "Image file is required" }, { status: 400 });
  }

  const body = new FormData();
  body.append("file", file, file.name);
  const slug = incoming.get("slug");
  const mediaKey = incoming.get("mediaKey");
  if (typeof slug === "string" && slug.trim()) body.append("slug", slug.trim());
  if (typeof mediaKey === "string" && mediaKey.trim()) body.append("mediaKey", mediaKey.trim());

  try {
    const response = await fetch(`${apiOrigin()}/api/admin/uploads`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
      cache: "no-store",
    });
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ message: "Couldn't reach the server" }, { status: 502 });
  }
}
