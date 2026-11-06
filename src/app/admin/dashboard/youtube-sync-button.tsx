"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SyncResult = {
  fetched: number;
  attached: { slug: string }[];
  alreadyLinked: number;
  unmatched: { title: string }[];
};

/** Pulls the channel's latest videos now instead of waiting for the half-hourly check. */
export function YoutubeSyncButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onClick() {
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/youtube/sync", { method: "POST" });
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      const body = (await response.json().catch(() => null)) as (SyncResult & { message?: string }) | null;
      if (!response.ok || !body) {
        setMessage(body?.message ?? "Couldn't sync YouTube");
        return;
      }
      const missing = body.unmatched.length ? ` ${body.unmatched.length} without a story with the same title: ${body.unmatched.map((v) => `“${v.title}”`).join(", ")}.` : "";
      setMessage(`${body.fetched} on the channel, ${body.attached.length} added.${missing}`);
      router.refresh();
    } catch {
      setMessage("Couldn't reach the server");
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="text-sm font-semibold text-accent-2 disabled:opacity-60"
      >
        {pending ? "Syncing…" : "Sync YouTube"}
      </button>
      {message ? <span className="max-w-[420px] text-[13px] text-faded">{message}</span> : null}
    </span>
  );
}
