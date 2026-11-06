"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export type StripDay = { label: string; href: string; active: boolean };

/** The seven days around the chosen one. On a narrow screen it scrolls and keeps the chosen day in view. */
export function DayStrip({ days }: { days: StripDay[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[aria-current='date']");
    if (!list || !active) return;
    list.scrollLeft = active.offsetLeft - (list.clientWidth - active.clientWidth) / 2;
  }, []);

  return (
    <nav aria-label="Days" className="border-y border-ink/25">
      <ul ref={listRef} className="m-0 flex list-none overflow-x-auto p-0 [scrollbar-width:none]">
        {days.map((day) => (
          <li key={day.label} className="relative flex min-w-[88px] flex-1">
            <Link
              href={day.href}
              aria-current={day.active ? "date" : undefined}
              className={`flex w-full items-center justify-center font-mono text-[15px] font-bold tracking-[0.04em] ${
                day.active
                  ? "-my-px h-[50px] bg-rust text-white"
                  : "h-12 text-ink hover:text-rust after:absolute after:top-1/2 after:right-0 after:h-4 after:w-px after:-translate-y-1/2 after:bg-ink/35"
              }`}
            >
              {day.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
