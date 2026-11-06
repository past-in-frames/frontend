"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { BookmarkIcon, LogoMark, SearchIcon } from "@/components/icons";
import { sectionNav } from "@/lib/story-path";

const SEARCH_DEBOUNCE_MS = 500;

const nav = [
  { href: "/", label: "On This Day", activeOn: "/on-this-day" },
  { href: "/explore", label: "Explore", activeOn: "/explore" },
  { href: "/collections", label: "Collections", activeOn: "/collections" },
  { href: "/watch", label: "Watch", activeOn: "/watch" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
  }, [pathname]);

  // Navigating away closes the search bar, without waiting for an effect.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setSearchOpen(pathname === "/search");
  }

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const links = nav.map((item) => {
    // The home page is the On This Day page for today, which the design leaves unmarked.
    const current = pathname.startsWith(item.activeOn);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={current ? "page" : undefined}
        className={`whitespace-nowrap text-[15px] font-semibold ${
          current ? "text-rust underline decoration-2 underline-offset-[6px]" : "text-ink hover:text-rust"
        }`}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <header className="sticky top-0 z-40 bg-cream">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="border-b-2 border-ink/85">
          <div className="flex h-[60px] items-center gap-4 sm:h-16">
            <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Past In Frames home">
              <LogoMark size={40} />
              <span className="font-serif text-[22px] leading-none font-bold tracking-[-0.01em] sm:text-[26px]">
                Past In Frames
              </span>
            </Link>

            <span aria-hidden="true" className="ml-2 hidden h-8 w-px bg-ink/35 md:block" />
            <nav aria-label="Main" className="hidden items-center gap-6 md:flex lg:gap-8">
              {links}
            </nav>

            <div className="ml-auto flex items-center gap-3 md:gap-4">
              <span aria-hidden="true" className="hidden h-8 w-px bg-ink/35 md:block" />
              <button
                type="button"
                aria-label="Search stories"
                aria-expanded={searchOpen}
                onClick={() => setSearchOpen((open) => !open)}
                className="flex size-9 items-center justify-center text-ink hover:text-rust"
              >
                <SearchIcon size={24} />
              </button>
              <Link
                href="/saved"
                aria-label="Saved stories"
                className="flex size-9 items-center justify-center text-ink hover:text-rust"
              >
                <BookmarkIcon size={24} />
              </Link>
            </div>
          </div>

          <nav
            aria-label="Main"
            className="-mx-4 flex items-center gap-6 overflow-x-auto px-4 pb-3 md:hidden"
          >
            {links}
          </nav>

          <nav
            aria-label="Sections"
            className="-mx-4 flex items-center gap-5 overflow-x-auto border-t border-ink/20 px-4 py-2.5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
          >
            {sectionNav.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`whitespace-nowrap text-[13px] font-semibold tracking-wide uppercase ${
                    current ? "text-rust" : "text-muted hover:text-rust"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {searchOpen ? (
            <TitleSearch id="header-search" query={query} inputRef={searchRef} className="pb-3" />
          ) : null}
        </div>
      </div>
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
          className="h-11 w-full border border-ink/30 bg-white pr-4 pl-9 text-sm outline-none placeholder:text-pale focus:border-ink/60"
        />
      </div>
    </form>
  );
}
