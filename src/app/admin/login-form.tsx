"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(body?.message ?? "Incorrect password");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xs flex-col gap-3">
      <input
        autoFocus
        name="password"
        type="password"
        autoComplete="current-password"
        aria-label="Password"
        disabled={pending}
        className="h-11 w-full rounded-[10px] border border-ink/20 bg-white px-4 font-sans text-[15px] outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-[10px] bg-accent-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error ? (
        <p className="m-0 text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
