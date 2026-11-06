import Image from "next/image";

export function CalendarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--ink)"
      strokeWidth="2"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

/**
 * The header and footer each render a mark, and the header keeps a second one
 * for the other breakpoint. Lazy loading is what stops the copies that are
 * hidden at the current width from being fetched and preloaded as well.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 overflow-hidden rounded-[7px]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full origin-center scale-[1.55] object-cover"
      />
    </span>
  );
}

export function BookmarkIcon({ size = 22, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-6-4.5L6 21z" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** Rust disc with a white triangle, drawn over video thumbnails. */
export function PlayBadge({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="var(--rust)" />
      <path d="M19 15.5v17l14-8.5z" fill="#fff" />
    </svg>
  );
}

const topicIcon = {
  width: 40,
  height: 40,
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function PeopleIcon() {
  return (
    <svg {...topicIcon}>
      <circle cx="24" cy="14" r="5.5" />
      <circle cx="10" cy="19" r="4.5" />
      <circle cx="38" cy="19" r="4.5" />
      <path d="M14 38c0-6 4.5-10 10-10s10 4 10 10" />
      <path d="M3 34c0-4.5 3-7.5 7-7.5M45 34c0-4.5-3-7.5-7-7.5" />
    </svg>
  );
}

export function PlacesIcon() {
  return (
    <svg {...topicIcon}>
      <path d="M24 44S9 30.5 9 19a15 15 0 0 1 30 0C39 30.5 24 44 24 44z" />
      <circle cx="24" cy="19" r="5.5" />
    </svg>
  );
}

export function ErasIcon() {
  return (
    <svg {...topicIcon}>
      <path d="M6 16 24 5l18 11v3H6z" />
      <path d="M6 42h36M10 42V22M19 42V22M29 42V22M38 42V22M8 22h32" />
    </svg>
  );
}

export function ScienceIcon() {
  return (
    <svg {...topicIcon}>
      <circle cx="24" cy="24" r="9" />
      <path d="M5 33c-2-4 6-12 18-17 12-5 21-5 21-1 0 3-6 8-14 12" />
      <path d="M29 38c-9 2-20 1-24-5" />
    </svg>
  );
}
