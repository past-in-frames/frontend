"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronDownIcon } from "@/components/icons";
import { rustButtonClass } from "@/components/ui";
import { daysInMonth, monthName, onThisDayHref, type MonthDay } from "@/lib/on-this-day";

const selectClass =
  "h-11 w-full appearance-none border border-ink/40 bg-transparent pr-9 pl-3 text-[15px] outline-none focus:border-rust";

export function BirthdayForm({ initial, today }: { initial: MonthDay; today: MonthDay }) {
  const router = useRouter();
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  function onMonth(next: number) {
    setMonth(next);
    // Picking a shorter month must not leave the day out of range.
    setDay((current) => Math.min(current, daysInMonth(next)));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(onThisDayHref({ month, day }, "all", today));
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid max-w-[360px] grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 text-[15px]">
          Month
          <span className="relative">
            <select value={month} onChange={(event) => onMonth(Number(event.target.value))} className={selectClass}>
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index + 1}>
                  {monthName(index + 1)}
                </option>
              ))}
            </select>
            <Chevron />
          </span>
        </label>
        <label className="flex flex-col gap-1.5 text-[15px]">
          Day
          <span className="relative">
            <select value={day} onChange={(event) => setDay(Number(event.target.value))} className={selectClass}>
              {Array.from({ length: daysInMonth(month) }, (_, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <Chevron />
          </span>
        </label>
      </div>
      <button type="submit" className={`${rustButtonClass} self-start`}>
        Find my date →
      </button>
    </form>
  );
}

function Chevron() {
  return (
    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink">
      <ChevronDownIcon />
    </span>
  );
}
