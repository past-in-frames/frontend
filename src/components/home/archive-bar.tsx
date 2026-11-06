"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { outlineButtonClass } from "@/components/ui";
import {
  longMonthDay,
  monthDayFromIso,
  onThisDayHref,
  type MonthDay,
} from "@/lib/on-this-day";

/** Pick any calendar day to see what happened on it, or take a random story. */
export function ArchiveBar({ today }: { today: MonthDay }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("Choose a date");

  function onChange(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
    const day = monthDayFromIso(value);
    setLabel(longMonthDay(day));
    router.push(onThisDayHref(day, "all", today));
  }

  return (
    <div className="flex flex-col gap-4 border-t border-ink/25 pt-6 md:flex-row md:items-center">
      <h2 className="m-0 font-serif text-[30px] leading-[1.1] font-bold tracking-[-0.01em] sm:text-[34px]">
        Explore the Archive
      </h2>
      <span aria-hidden="true" className="mx-3 hidden h-10 w-px bg-ink/35 md:block" />
      <div className="flex flex-1 flex-wrap items-center gap-4 md:justify-end">
        <label className="relative block w-full min-w-[200px] max-w-[320px] flex-1 border border-ink/40">
          <span className="sr-only">Choose a date</span>
          <input
            ref={inputRef}
            type="date"
            onChange={(event) => onChange(event.target.value)}
            onClick={() => inputRef.current?.showPicker?.()}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <span className="flex h-11 items-center justify-between px-3 text-[15px]">
            {label}
            <ChevronDownIcon />
          </span>
        </label>
        {/* A plain link on purpose: /surprise is a route handler that redirects to a random story. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/surprise" className={outlineButtonClass}>
          Surprise me
        </a>
      </div>
    </div>
  );
}
