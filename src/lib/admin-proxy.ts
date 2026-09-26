import { cookies } from "next/headers";
import { apiOrigin } from "@/lib/api";

export async function proxyAdmin(path: string, init?: { method?: string; body?: string }) {
  const token = (await cookies()).get("admin_session")?.value;
  if (!token) {
    return Response.json({ message: "Not signed in" }, { status: 401 });
  }

  try {
    const response = await fetch(`${apiOrigin()}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      body: init?.body,
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
