"use client";

import Link from "next/link";
import { useState } from "react";
import { daysInMonth, monthName, onThisDayHref, type MonthDay } from "@/lib/on-this-day";

/** Anniversaries ignore the year, so the weekdays are laid out for a leap year where Feb 29 exists. */
const REFERENCE_YEAR = 2024;
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** A month calendar for picking a date. Every day is a link, so it works without scripts too. */
export function BirthdayCalendar({ initial, today }: { initial: MonthDay; today: MonthDay }) {
  const [month, setMonth] = useState(initial.month);
  const total = daysInMonth(month);
  const offset = new Date(Date.UTC(REFERENCE_YEAR, month - 1, 1)).getUTCDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, index) => index + 1),
  ];

  const step = (by: number) => setMonth((current) => ((current - 1 + by + 12) % 12) + 1);
  const arrow =
    "flex size-9 items-center justify-center text-[30px] leading-none font-semibold text-ink hover:text-rust focus-visible:outline-2 focus-visible:outline-rust";

  return (
    <div className="w-full max-w-[360px]" role="group" aria-label="Pick a date">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => step(-1)} aria-label="Previous month" className={arrow}>
          ‹
        </button>
        <span
          aria-live="polite"
          className="font-mono text-[20px] font-semibold tracking-[0.12em] text-rust uppercase"
        >
          {monthName(month, "long")}
        </span>
        <button type="button" onClick={() => step(1)} aria-label="Next month" className={arrow}>
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center font-mono text-[12px] font-semibold tracking-[0.08em] text-ink">
        {WEEKDAYS.map((name) => (
          <span key={name} className="pb-2">
            {name}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`blank-${index}`} />;
          const selected = month === initial.month && day === initial.day;
          const isToday = month === today.month && day === today.day;
          return (
            <Link
              key={day}
              href={onThisDayHref({ month, day }, "all", today)}
              prefetch={false}
              aria-label={`${monthName(month, "long")} ${day}`}
              aria-current={selected ? "date" : undefined}
              className={`mx-auto flex h-10 w-full max-w-[46px] items-center justify-center text-[16px] tabular-nums ${
                selected ? "bg-rust font-semibold text-white" : "hover:bg-rust/10 hover:text-rust"
              } ${isToday && !selected ? "underline decoration-rust decoration-2 underline-offset-4" : ""}`}
            >
              {day}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
