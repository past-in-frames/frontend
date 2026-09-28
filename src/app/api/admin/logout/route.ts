import { cookies } from "next/headers";
import { apiOrigin } from "@/lib/api";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (token) {
    // Best effort: the cookie is cleared even if the API is unreachable.
    await fetch(`${apiOrigin()}/api/admin/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }

  cookieStore.delete("admin_session");
  return Response.json({ ok: true });
}
