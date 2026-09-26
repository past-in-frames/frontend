"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackIcon, LogoMark, SearchIcon } from "@/components/icons";
import { categoryLinks, navItems } from "@/lib/content";

type SiteHeaderProps = {
  variant?: "home" | "article";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!categoriesOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!categoriesRef.current?.contains(event.target as Node)) {
        setCategoriesOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCategoriesOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [categoriesOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  const active = pathname.startsWith("/category")
    ? "categories"
    : pathname.startsWith("/trending")
      ? "trending"
      : pathname.startsWith("/about")
        ? "about"
        : "";

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
            <div ref={categoriesRef} className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={categoriesOpen}
                onClick={() => setCategoriesOpen((open) => !open)}
                className={`mi-navlink inline-flex items-center gap-1.5 ${
                  active === "categories" ? "border-b-2 border-accent text-ink" : "text-muted"
                }`}
              >
                Categories
                <Chevron open={categoriesOpen} />
              </button>
              {categoriesOpen && (
                <div
                  role="menu"
                  className="absolute top-full left-1/2 z-50 mt-4 min-w-[168px] -translate-x-1/2 rounded-xl border border-ink/12 bg-cream py-1.5 shadow-[0_12px_24px_rgba(23,24,28,0.08)]"
                >
                  {categoryLinks.map((item) => {
                    const current = pathname === item.href;
                    return (
                      <Link
                        key={item.slug}
                        href={item.href}
                        role="menuitem"
                        aria-current={current ? "page" : undefined}
                        onClick={() => setCategoriesOpen(false)}
                        className={`block px-4 py-2.5 text-sm ${
                          current ? "text-ink" : "text-muted hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} active={active} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3.5 lg:gap-4">
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              setSearchOpen(true);
              setMenuOpen(false);
              setCategoriesOpen(false);
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
            <div className="flex flex-col gap-3">
              <span className={active === "categories" ? "text-ink" : "text-muted"}>
                Categories
              </span>
              {categoryLinks.map((item) => {
                const current = pathname === item.href;
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className={`pl-3 ${current ? "text-ink" : "text-muted"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={active}
                menu
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
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

function NavLink({
  item,
  active,
  menu = false,
  onNavigate,
}: {
  item: (typeof navItems)[number];
  active: string;
  menu?: boolean;
  onNavigate?: () => void;
}) {
  const current = item.id === active;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={
        menu
          ? current
            ? "text-ink"
            : "text-muted"
          : `mi-navlink ${current ? "border-b-2 border-accent text-ink" : "text-muted"}`
      }
    >
      {item.label}
    </Link>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className={open ? "rotate-180" : undefined}
    >
      <path
        d="M2 3.5 L5 6.5 L8 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
