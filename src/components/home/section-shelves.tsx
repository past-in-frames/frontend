import Link from "next/link";
import type { CSSProperties } from "react";
import { Cover } from "@/components/ui";
import type { StorySummary } from "@/lib/api";
import { shortMonthDay } from "@/lib/on-this-day";
import { eventYear, sectionPaths, sections, storyPath, type SectionPath } from "@/lib/story-path";

/** The four sections shown first, as a 2 x 2 grid, each with its own quiet color on the top rule. */
const DESKS: { path: SectionPath; tone: string }[] = [
  { path: "politics", tone: "#2f4a6d" },
  { path: "war", tone: "#7a2e2a" },
  { path: "space", tone: "#34406f" },
  { path: "technology", tone: "#5c5a2e" },
];
const DESK_SIDE = 3;
const ROW_SIDE = 2;

/** "NOV 9 · 1913": the lead says which day it belongs to, since it may not be the chosen one. */
function dayYear(story: StorySummary) {
  const day = shortMonthDay({ month: Number(story.eventDate.slice(5, 7)), day: Number(story.eventDate.slice(8, 10)) });
  return `${day} · ${eventYear(story.eventDate)}`;
}

type Shelf = { path: SectionPath; label: string; lead: StorySummary; others: StorySummary[] };

/**
 * The home page's sections, for the chosen day: each section's stories are the ones nearest that
 * day, so the day itself comes first. Politics, War, Space and Technology are shown first as desks;
 * every other section follows as a row. A section with nothing to show is left out.
 */
export function SectionShelves({ byType }: { byType: Record<string, StorySummary[]> }) {
  const shelves = sectionPaths.flatMap((path): Shelf[] => {
    const data = byType[sections[path].type] ?? [];
    if (data.length === 0) return [];
    // The nearest day leads. Among the stories of that same day, one with a picture is preferred.
    const sameDay = data.filter((story) => story.eventDate.slice(5) === data[0].eventDate.slice(5));
    const lead = sameDay.find((story) => story.coverUrl) ?? data[0];
    return [{ path, label: sections[path].label, lead, others: data.filter((story) => story !== lead) }];
  });

  const byPath = new Map(shelves.map((shelf) => [shelf.path, shelf] as const));
  const desks = DESKS.flatMap(({ path, tone }) => {
    const shelf = byPath.get(path);
    return shelf ? [{ shelf, tone }] : [];
  });
  const deskPaths = new Set<SectionPath>(DESKS.map((desk) => desk.path));
  const rows = shelves.filter((shelf) => !deskPaths.has(shelf.path));

  return (
    <>
      {desks.length > 0 ? (
        <div className="grid gap-x-11 gap-y-10 border-b border-ink/85 pb-10 md:grid-cols-2">
          {desks.map(({ shelf, tone }) => (
            <Desk key={shelf.path} shelf={shelf} tone={tone} />
          ))}
        </div>
      ) : null}
      {rows.map((shelf, index) => (
        // Every third row is mirrored, so the page does not repeat one layout down its whole length.
        <Row key={shelf.path} shelf={shelf} reversed={index % 3 === 2} />
      ))}
    </>
  );
}

function Desk({ shelf, tone }: { shelf: Shelf; tone: string }) {
  const style = { "--tone": tone } as CSSProperties;
  const lead = shelf.lead;
  const year = eventYear(lead.eventDate);

  return (
    <article
      aria-labelledby={`desk-${shelf.path}`}
      style={style}
      className="flex min-w-0 flex-col gap-4 border-t-[3px] border-[var(--tone)] pt-3.5"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id={`desk-${shelf.path}`}
          className="m-0 font-sans text-[13px] font-semibold tracking-[0.14em] text-[var(--tone)] uppercase"
        >
          {shelf.label}
        </h2>
        <Link href={`/${shelf.path}`} className="text-[15px] font-semibold whitespace-nowrap text-ink hover:text-rust">
          All {shelf.label.split(" & ")[0]} →
        </Link>
      </div>

      <Link
        href={storyPath(lead.type, lead.slug) ?? "/"}
        className="mi-card grid items-start gap-4 min-[520px]:grid-cols-2"
      >
        {lead.coverUrl ? (
          <Cover
            src={lead.coverUrl}
            alt={lead.coverAlt ?? ""}
            sizes="(min-width: 1200px) 270px, (min-width: 768px) 22vw, (min-width: 520px) 45vw, 100vw"
            aspect="aspect-[4/3]"
          />
        ) : (
          // No picture: a panel in the section's color, with the year as the picture.
          <span
            aria-hidden="true"
            className="flex aspect-[2.6/1] w-full items-center justify-center bg-[linear-gradient(135deg,var(--tone),color-mix(in_srgb,var(--tone)_62%,#f8f3ea))] font-serif text-[48px] leading-none font-bold text-[#f8f3ea] tabular-nums min-[520px]:aspect-[4/3] min-[520px]:text-[56px]"
          >
            {year}
          </span>
        )}
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs font-semibold tracking-[0.1em] text-rust">{dayYear(lead)}</span>
          <h3 className="mi-card-title m-0 font-serif text-[24px] leading-[1.15] font-bold text-balance sm:text-[26px]">
            {lead.title}
          </h3>
          {lead.coverIsAi ? <span className="font-serif text-sm text-muted italic">Illustration</span> : null}
        </div>
      </Link>

      <ul className="m-0 list-none border-t border-ink/35 p-0">
        {shelf.others.slice(0, DESK_SIDE).map((story) => (
          <li key={story.slug} className="border-b border-ink/20">
            <Link
              href={storyPath(story.type, story.slug) ?? "/"}
              className="mi-card grid grid-cols-[52px_minmax(0,1fr)] gap-2.5 py-2.5"
            >
              <span className="pt-[5px] font-mono text-xs font-semibold tracking-[0.08em] text-rust">
                {eventYear(story.eventDate)}
              </span>
              <span className="mi-card-title font-serif text-[18px] leading-[1.25] font-semibold">{story.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Row({ shelf, reversed }: { shelf: Shelf; reversed: boolean }) {
  const side = shelf.others.slice(0, ROW_SIDE);

  return (
    <section className="flex flex-col gap-5 border-b border-ink/85 pb-8" aria-labelledby={`shelf-${shelf.path}`}>
      <div className="flex items-baseline justify-between gap-4 border-b border-ink/35 pb-2">
        <h2
          id={`shelf-${shelf.path}`}
          className="m-0 font-serif text-[30px] leading-[1.1] font-bold tracking-[-0.01em] sm:text-[34px]"
        >
          {shelf.label}
        </h2>
        <Link href={`/${shelf.path}`} className="text-[15px] font-semibold whitespace-nowrap text-rust hover:underline">
          View all →
        </Link>
      </div>

      <div
        className={`grid gap-6 ${
          side.length === 0
            ? ""
            : reversed
              ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] md:gap-0"
              : "md:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] md:gap-0"
        }`}
      >
        <RowLead story={shelf.lead} reversed={reversed} />
        {side.length > 0 ? (
          <ul
            className={`m-0 flex list-none flex-col border-t border-ink/25 p-0 pt-1 md:border-t-0 md:border-ink/35 md:pt-0 ${
              reversed ? "md:order-first md:border-r md:pr-6" : "md:border-l md:pl-6"
            }`}
          >
            {side.map((story, index) => (
              <li key={story.slug} className={index > 0 ? "border-t border-ink/25" : ""}>
                <Link href={storyPath(story.type, story.slug) ?? "/"} className="mi-card flex flex-col gap-1 py-3 md:py-4">
                  <span className="font-serif text-[15px] leading-none font-bold text-rust tabular-nums">
                    {eventYear(story.eventDate)}
                  </span>
                  <h3 className="mi-card-title m-0 font-serif text-[19px] leading-[1.2] font-bold sm:text-[21px]">
                    {story.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function RowLead({ story, reversed }: { story: StorySummary; reversed: boolean }) {
  const gap = reversed ? "md:ml-6" : "md:mr-6";
  const href = storyPath(story.type, story.slug) ?? "/";
  const year = eventYear(story.eventDate);

  // No picture: the year itself is the picture.
  if (!story.coverUrl) {
    return (
      <Link
        href={href}
        className={`mi-card grid items-center gap-4 bg-[linear-gradient(135deg,#f1e4c8,#e6d3ab)] px-6 py-6 sm:gap-6 ${gap} ${
          reversed ? "sm:grid-cols-[minmax(0,1fr)_auto]" : "sm:grid-cols-[auto_minmax(0,1fr)]"
        }`}
      >
        <span
          className={`font-serif text-[64px] leading-none font-bold text-rust tabular-nums sm:text-[88px] ${reversed ? "sm:order-last" : ""}`}
        >
          {year}
        </span>
        <h3
          className={`mi-card-title m-0 border-ink/35 font-serif text-[26px] leading-[1.12] font-bold sm:text-[32px] ${
            reversed ? "sm:border-r sm:pr-6" : "sm:border-l sm:pl-6"
          }`}
        >
          {story.title}
        </h3>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`mi-card grid items-center gap-4 sm:gap-6 ${gap} ${
        reversed ? "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" : "sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      }`}
    >
      <div className={reversed ? "sm:order-last" : ""}>
        <Cover
          src={story.coverUrl}
          alt={story.coverAlt ?? ""}
          sizes="(min-width: 1200px) 400px, (min-width: 640px) 40vw, 100vw"
          aspect="aspect-[1.9/1]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-serif text-base leading-none font-bold text-rust tabular-nums">{dayYear(story)}</span>
        <h3 className="mi-card-title m-0 font-serif text-[26px] leading-[1.12] font-bold text-balance sm:text-[32px]">
          {story.title}
        </h3>
        {story.coverIsAi ? <span className="font-serif text-sm text-muted italic">Illustration</span> : null}
      </div>
    </Link>
  );
}
