"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "@/components/icons";
import { isDefaultWindow, resolveStoryWindow, type StoryWindow } from "@/lib/story-dates";
import { formatEventDate, formatMonthDay } from "@/lib/story-path";
import { storySortHref, type StorySort } from "@/lib/story-sort";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type Draft = { start: string | null; end: string | null };

const emptyDraft: Draft = { start: null, end: null };

export function StoryDateFilter({
  path,
  sort,
  query,
  from,
  to,
  today,
}: {
  path: string;
  sort: StorySort;
  query?: string;
  from?: string;
  to?: string;
  today: string;
}) {
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const storyWindow = resolveStoryWindow({ from, to }, today);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [cursor, setCursor] = useState(() => monthOf(storyWindow.to));
  const range = draftRange(draft);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function commit(next: { from?: string; to?: string }) {
    router.push(storySortHref(path, sort, { query, from: next.from, to: next.to, today }), {
      scroll: false,
    });
  }

  function openPanel() {
    setCursor(monthOf(storyWindow.from ?? storyWindow.to));
    if (storyWindow.from) setDraft({ start: storyWindow.from, end: storyWindow.to });
    else if (from || to) setDraft({ start: storyWindow.to, end: null });
    else setDraft(emptyDraft);
    setOpen(true);
  }

  function pick(day: string) {
    setDraft((current) => {
      if (!current.start || current.end) return { start: day, end: null };
      if (current.start === day) return current;
      return { start: current.start, end: day };
    });
  }

  function showRange() {
    if (!range) return;
    setOpen(false);
    commit(range);
  }

  function showThisDayAndEarlier() {
    const ceiling = range?.to ?? draft.start;
    if (!ceiling) return;
    setOpen(false);
    commit({ to: ceiling });
  }

  function reset() {
    setDraft(emptyDraft);
    setOpen(false);
    setCursor(monthOf(today));
    commit({});
  }

  const custom = !isDefaultWindow(storyWindow, today);
  const cells = monthCells(cursor.year, cursor.month);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={`inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-sm font-semibold ${
          custom ? "border-ink/40 text-ink" : "border-ink/18 text-muted hover:border-ink/40"
        }`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open) setOpen(false);
          else openPanel();
        }}
      >
        <CalendarIcon />
        {windowLabel(storyWindow, today)}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Filter by date"
          className="absolute left-0 z-30 mt-2 w-[320px] rounded-2xl border border-ink/12 bg-white p-3 shadow-[0_16px_40px_rgba(23,24,28,0.12)]"
        >
          <div className="mb-2 grid grid-cols-2 gap-2">
            <DraftDate label="From" value={range?.from ?? draft.start ?? undefined} />
            <DraftDate label="To" value={range?.to} />
          </div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex gap-1">
              <StepButton label="Previous year" onClick={() => setCursor((current) => shiftMonth(current, -12))}>
                «
              </StepButton>
              <StepButton label="Previous month" onClick={() => setCursor((current) => shiftMonth(current, -1))}>
                ‹
              </StepButton>
            </div>
            <p className="m-0 font-serif text-[15px] font-semibold">
              {monthName(cursor.year, cursor.month)}
            </p>
            <div className="flex gap-1">
              <StepButton label="Next month" onClick={() => setCursor((current) => shiftMonth(current, 1))}>
                ›
              </StepButton>
              <StepButton label="Next year" onClick={() => setCursor((current) => shiftMonth(current, 12))}>
                »
              </StepButton>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 text-[10px] font-bold tracking-[0.08em] text-pale uppercase">
                {day}
              </span>
            ))}
            {cells.map((day, index) =>
              day ? (
                <DayButton
                  key={day}
                  day={day}
                  today={today}
                  from={range?.from}
                  to={range?.to ?? draft.start ?? undefined}
                  onPick={pick}
                />
              ) : (
                <span key={`empty-${index}`} />
              ),
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={showRange}
              disabled={!range}
              className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Show range
            </button>
            <button
              type="button"
              onClick={showThisDayAndEarlier}
              disabled={!draft.start}
              className="rounded-full border border-ink/15 px-3 py-2 text-sm font-semibold text-muted disabled:opacity-40"
            >
              This day and earlier
            </button>
          </div>
          <p className="m-0 mt-2 text-xs leading-relaxed text-faded">
            {range
              ? "Shows only the days between these two dates, newest first."
              : "Pick two days for a range, or one day to walk backward from it."}
          </p>

          {custom ? (
            <button
              type="button"
              onClick={reset}
              className="mt-2 text-xs font-semibold text-accent-2 hover:text-accent-2-dark"
            >
              Reset to today
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DraftDate({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-cream px-2.5 py-2">
      <span className="block text-[10px] font-bold tracking-[0.08em] text-faded uppercase">{label}</span>
      <span className="mt-0.5 block text-xs font-semibold text-ink">
        {value ? formatEventDate(value) : "Pick a day"}
      </span>
    </div>
  );
}

function draftRange(draft: Draft) {
  if (!draft.start || !draft.end || draft.start === draft.end) return null;
  const from = draft.start < draft.end ? draft.start : draft.end;
  const to = draft.start < draft.end ? draft.end : draft.start;
  return { from, to };
}

function DayButton({
  day,
  today,
  from,
  to,
  onPick,
}: {
  day: string;
  today: string;
  from?: string;
  to?: string;
  onPick: (day: string) => void;
}) {
  const endpoint = day === to || day === from;
  const inRange = Boolean(from) && Boolean(to) && day >= from! && day <= to!;
  const number = Number(day.slice(8));

  return (
    <button
      type="button"
      onClick={() => onPick(day)}
      aria-pressed={endpoint}
      aria-label={formatEventDate(day)}
      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm ${
        endpoint
          ? "bg-ink font-semibold text-white"
          : inRange
            ? "bg-accent-2/15 font-semibold text-ink"
            : day === today
              ? "font-semibold text-accent-2 ring-1 ring-accent-2/50"
              : "text-muted hover:bg-ink/5"
      }`}
    >
      {number}
    </button>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-base text-muted hover:bg-ink/5 hover:text-ink"
    >
      {children}
    </button>
  );
}

function windowLabel(window: StoryWindow, today: string) {
  if (isDefaultWindow(window, today)) return "Today and earlier";
  if (!window.from) return `${formatEventDate(window.to)} and earlier`;
  const sameYear = window.from.slice(0, 4) === window.to.slice(0, 4);
  return sameYear
    ? `${formatMonthDay(window.from)} – ${formatEventDate(window.to)}`
    : `${formatEventDate(window.from)} – ${formatEventDate(window.to)}`;
}

function monthOf(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  return { year, month: month - 1 };
}

function shiftMonth(cursor: { year: number; month: number }, amount: number) {
  const date = new Date(Date.UTC(cursor.year, cursor.month + amount, 1));
  const year = date.getUTCFullYear();
  if (year < 1 || year > 9999) return cursor;
  return { year, month: date.getUTCMonth() };
}

function monthName(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));
}

function monthCells(year: number, month: number) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    );
  }
  return cells;
}
