import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiOrigin } from "@/lib/api";

export const ADMIN_COOKIE = "admin_session";

async function sessionToken() {
  return (await cookies()).get(ADMIN_COOKIE)?.value;
}

/**
 * Forwards an admin request from a route handler to the API, keeping the
 * session token in an httpOnly cookie instead of exposing it to the browser.
 */
export async function proxyAdmin(path: string, init?: { method?: string; body?: string }) {
  const token = await sessionToken();
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

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return Response.json({ message: "Couldn't reach the server" }, { status: 502 });
  }
}

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

/**
 * Loads admin data inside a server component. Missing or rejected sessions send
 * the reader back to the sign-in page rather than rendering a broken screen.
 */
export async function loadAdmin<T>(path: string): Promise<AdminResult<T>> {
  const token = await sessionToken();
  if (!token) {
    redirect("/admin");
  }

  let response: Response;
  try {
    response = await fetch(`${apiOrigin()}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 502, error: "Couldn't reach the server" };
  }

  if (response.status === 401) {
    redirect("/admin");
  }
  if (!response.ok) {
    return { ok: false, status: response.status, error: "Couldn't load this page" };
  }

  return { ok: true, data: (await response.json()) as T };
}
