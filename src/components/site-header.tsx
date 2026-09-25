"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BackIcon, LogoMark, SearchIcon } from "@/components/icons";
import { navItems } from "@/lib/content";

type SiteHeaderProps = {
  variant?: "home" | "article";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  const active =
    pathname.startsWith("/article") || pathname === "/trending"
      ? "trending"
      : "explore";

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-ink/12 bg-cream px-[18px] lg:h-[84px] lg:px-16">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-10">
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

          {variant === "article" ? (
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <BackIcon />
              <span className="text-sm font-semibold text-muted">Back</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <LogoMark size={32} />
              <span className="font-serif text-base font-semibold">Past In Frames</span>
            </Link>
          )}

          <nav className="hidden items-center gap-7 text-[15px] font-semibold lg:flex">
            {navItems.map((item) => {
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`mi-navlink ${
                    isActive
                      ? "border-b-2 border-accent text-ink"
                      : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3.5 lg:gap-4">
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              setSearchOpen(true);
              setMenuOpen(false);
            }}
            className={`flex size-[34px] items-center justify-center rounded-full border border-ink/16 bg-transparent lg:size-[38px] ${
              variant === "article" ? "hidden lg:flex" : ""
            }`}
          >
            <SearchIcon size={variant === "article" ? 17 : 15} />
          </button>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((open) => !open);
              setSearchOpen(false);
            }}
            className="flex size-[34px] flex-col items-center justify-center gap-1 rounded-lg bg-ink lg:hidden"
          >
            <span className="h-0.5 w-4 rounded-sm bg-cream" />
            <span className="h-0.5 w-4 rounded-sm bg-cream" />
            <span className="h-0.5 w-4 rounded-sm bg-cream" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-ink/12 bg-cream px-[18px] py-6 shadow-[0_12px_24px_rgba(23,24,28,0.08)] lg:hidden">
          <nav className="flex flex-col gap-4 text-base font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={item.id === active ? "text-ink" : "text-muted"}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/#newsletter"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-ink text-sm font-bold text-cream"
            >
              Subscribe
            </Link>
          </nav>
        </div>
      )}

      {searchOpen && (
        <div className="absolute inset-x-0 top-16 border-b border-ink/12 bg-cream px-[18px] py-5 shadow-[0_12px_24px_rgba(23,24,28,0.08)] lg:px-16">
          <form
            className="flex gap-2.5"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              autoFocus
              type="search"
              placeholder="Search curiosities"
              aria-label="Search curiosities"
              className="h-11 flex-1 rounded-[10px] border border-ink/20 bg-white px-4 font-sans text-[15px] outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="h-11 rounded-[10px] px-4 text-sm font-semibold text-muted"
            >
              Close
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
