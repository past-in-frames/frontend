"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { BackIcon, LogoMark, SearchIcon } from "@/components/icons";
import { miscellaneousHref, sectionFromPath, sectionNav } from "@/lib/story-path";

const desktopSearchClass = "hidden w-[220px] shrink-0 lg:block xl:w-[260px]";
const SEARCH_DEBOUNCE_MS = 500;

export function SiteHeader() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const [focusSearch, setFocusSearch] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  // Navigating away closes whatever was open, without waiting for an effect.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setMenuOpen(false);
  }

  // A story page is /science/<slug> (or history, others). The mobile header shows "Back" there.
  const [section] = pathname.split("/").filter(Boolean);
  const isStory = pathname.split("/").filter(Boolean).length === 2 && sectionFromPath(section ?? "") !== null;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !focusSearch) return;
    mobileSearchRef.current?.focus();
    setFocusSearch(false);
  }, [menuOpen, focusSearch]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-ink/12 bg-cream px-[18px] lg:h-[84px] lg:px-16">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-10">
          <Link
            href="/"
            className="hidden items-center gap-2.5 lg:flex"
            aria-label="Past In Frames home"
          >
            <LogoMark size={40} />
            <span className="font-serif text-xl font-semibold tracking-[-0.01em]">
              Past In Frames
            </span>
          </Link>

          {isStory ? (
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <BackIcon />
              <span className="text-sm font-semibold text-muted">Back</span>
            </Link>
          ) : (
            <Link href="/" className="flex min-w-0 items-center gap-2 lg:hidden">
              <LogoMark size={32} />
              <span className="truncate font-serif text-[17px] font-semibold">
                Past In Frames
              </span>
            </Link>
          )}

          <nav className="hidden items-center gap-7 text-[15px] font-semibold lg:flex">
            {sectionNav.map((section) => {
              const current = isSectionActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={current ? "page" : undefined}
                  className={navLinkClass(current, true)}
                >
                  {section.label}
                </Link>
              );
            })}
            <MiscellaneousMark current={isSectionActive(pathname, miscellaneousHref)} desktop />
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <TitleSearch
            id="header-search"
            query={query}
            className={desktopSearchClass}
            onNavigate={closeMenu}
          />
          <button
            type="button"
            aria-label="Search stories"
            onClick={() => {
              setMenuOpen(true);
              setFocusSearch(true);
            }}
            className="flex size-9 items-center justify-center text-ink lg:hidden"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 flex-col items-center justify-center gap-1 rounded-full bg-ink lg:hidden"
          >
            <span className="h-0.5 w-4 rounded-sm bg-cream" />
            <span className="h-0.5 w-4 rounded-sm bg-cream" />
            <span className="h-0.5 w-4 rounded-sm bg-cream" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="absolute inset-x-0 top-16 border-b border-ink/12 bg-cream px-[18px] py-6 shadow-[0_12px_24px_rgba(23,24,28,0.08)] lg:hidden">
          <TitleSearch
            id="header-search-mobile"
            query={query}
            inputRef={mobileSearchRef}
            className="mb-5"
            onNavigate={closeMenu}
          />
          <nav className="flex flex-col gap-4 text-base font-semibold">
            {sectionNav.map((section) => {
              const current = isSectionActive(pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  aria-current={current ? "page" : undefined}
                  className={current ? "text-ink" : "text-muted"}
                >
                  {section.label}
                </Link>
              );
            })}
            <MiscellaneousMark current={isSectionActive(pathname, miscellaneousHref)} />
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function TitleSearch({
  id,
  query,
  className,
  inputRef,
  onNavigate,
}: {
  id: string;
  query: string;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  const onNavigateRef = useRef(onNavigate);
  const timerRef = useRef<number | null>(null);

  if (query !== seenQuery) {
    setSeenQuery(query);
    setValue(query);
  }

  onNavigateRef.current = onNavigate;

  useEffect(() => {
    const next = value.trim();
    if (next === query.trim()) return;

    timerRef.current = window.setTimeout(() => {
      const current = new URLSearchParams(window.location.search).get("q") ?? "";
      if (next === current.trim()) return;
      onNavigateRef.current?.();
      if (!next) {
        if (window.location.pathname === "/search") router.push("/");
        return;
      }
      const href = `/search?q=${encodeURIComponent(next)}`;
      if (window.location.pathname === "/search") router.replace(href);
      else router.push(href);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [query, router, value]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const next = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (!next) return;
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <form action="/search" method="get" role="search" onSubmit={onSubmit} className={className}>
      <div className="relative">
        <button
          type="submit"
          aria-label="Search"
          className="absolute top-1/2 left-3 flex -translate-y-1/2 text-faded"
        >
          <SearchIcon size={16} />
        </button>
        <input
          ref={inputRef}
          id={id}
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search by title"
          aria-label="Search stories by title"
          enterKeyHint="search"
          autoComplete="off"
          className="h-10 w-full rounded-full border border-ink/18 bg-white pr-4 pl-9 text-sm outline-none placeholder:text-pale focus:border-ink/40"
        />
      </div>
    </form>
  );
}

function isSectionActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(current: boolean, desktop: boolean) {
  const tone = current ? "text-ink" : "text-muted";
  if (!desktop) return tone;
  return `mi-navlink ${current ? "border-b-2 border-accent" : ""} ${tone}`;
}

function MiscellaneousMark({ current, desktop = false }: { current: boolean; desktop?: boolean }) {
  return (
    <span className="group relative">
      <Link
        href={miscellaneousHref}
        aria-current={current ? "page" : undefined}
        aria-label="Miscellaneous & Interesting"
        className={`outline-none ${navLinkClass(current, desktop)}`}
      >
        M&I
      </Link>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full left-0 z-10 mt-3 hidden rounded-[10px] border border-ink/12 bg-cream px-3 py-2 text-sm font-semibold whitespace-nowrap text-muted shadow-[0_12px_24px_rgba(23,24,28,0.08)] group-hover:block group-focus-within:block"
      >
        Miscellaneous & Interesting
      </span>
    </span>
  );
}
