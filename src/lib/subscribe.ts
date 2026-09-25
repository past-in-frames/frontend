"use server";

import { ApiError, createSubscriber } from "@/lib/api";

export async function subscribe(
  email: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await createSubscriber(email);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Could not subscribe";
    return { ok: false, message };
  }
}
