import { cookies } from "next/headers";
import { apiOrigin } from "@/lib/api";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ message: "Incorrect password" }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${apiOrigin()}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { message: "Couldn't reach the server" },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    return Response.json(
      { message: body?.message ?? "Incorrect password" },
      { status: response.status },
    );
  }

  const session = (await response.json()) as {
    token?: string;
    expiresAt?: string;
  };
  if (!session.token || !session.expiresAt) {
    return Response.json(
      { message: "Couldn't reach the server" },
      { status: 502 },
    );
  }

  const maxAge = Math.floor(
    (Date.parse(session.expiresAt) - Date.now()) / 1000,
  );
  if (!Number.isFinite(maxAge) || maxAge <= 0) {
    return Response.json(
      { message: "Couldn't reach the server" },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_session", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return Response.json({ ok: true });
}
