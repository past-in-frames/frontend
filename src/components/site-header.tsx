"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackIcon, LogoMark } from "@/components/icons";
import { categoryLabel, categoryPath } from "@/lib/story-path";

export function SiteHeader({ categories }: { categories: string[] }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Navigating away closes whatever was open, without waiting for an effect.
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setMenuOpen(false);
    setCategoriesOpen(false);
  }

  // A story page is /category/<category>/<slug>; the mobile header shows "Back" there.
  const isStory = pathname.split("/").filter(Boolean).length === 3;
  const active = pathname.startsWith("/category")
    ? "categories"
    : pathname.startsWith("/about")
      ? "about"
      : "";

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
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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

          {isStory ? (
            <Link href="/" className="flex items-center gap-2.5 lg:hidden">
              <BackIcon />
              <span className="text-sm font-semibold text-muted">Back</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <LogoMark size={32} />
              <span className="font-serif text-[17px] font-semibold">
                Past In Frames
              </span>
            </Link>
          )}

          <nav className="hidden items-center gap-7 text-[15px] font-semibold lg:flex">
            {categories.length > 0 ? (
              <div ref={categoriesRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCategoriesOpen((open) => !open)}
                  aria-expanded={categoriesOpen}
                  className={`mi-navlink flex items-center gap-1.5 ${
                    active === "categories"
                      ? "border-b-2 border-accent text-ink"
                      : "text-muted"
                  }`}
                >
                  Categories
                  <Chevron open={categoriesOpen} />
                </button>
                {categoriesOpen ? (
                  <div className="absolute top-full left-0 mt-3 flex min-w-[200px] flex-col rounded-[10px] border border-ink/12 bg-cream py-2 shadow-[0_12px_24px_rgba(23,24,28,0.08)]">
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={categoryPath(category)}
                        className="px-4 py-2 text-sm font-semibold text-muted hover:text-ink"
                      >
                        {categoryLabel(category)}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <Link
              href="/about"
              aria-current={active === "about" ? "page" : undefined}
              className={`mi-navlink ${
                active === "about" ? "border-b-2 border-accent text-ink" : "text-muted"
              }`}
            >
              About
            </Link>
          </nav>
        </div>

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

      {menuOpen ? (
        <div className="absolute inset-x-0 top-16 border-b border-ink/12 bg-cream px-[18px] py-6 shadow-[0_12px_24px_rgba(23,24,28,0.08)] lg:hidden">
          <nav className="flex flex-col gap-4 text-base font-semibold">
            {categories.length > 0 ? (
              <div className="flex flex-col gap-3">
                <span className="text-muted">Categories</span>
                {categories.map((category) => {
                  const href = categoryPath(category);
                  const current = pathname === href;
                  return (
                    <Link
                      key={category}
                      href={href}
                      aria-current={current ? "page" : undefined}
                      className={`pl-3 ${current ? "text-ink" : "text-muted"}`}
                    >
                      {categoryLabel(category)}
                    </Link>
                  );
                })}
              </div>
            ) : null}
            <Link
              href="/about"
              aria-current={active === "about" ? "page" : undefined}
              className={active === "about" ? "text-ink" : "text-muted"}
            >
              About
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
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
