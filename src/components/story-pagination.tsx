import Link from "next/link";
import { pageHref } from "@/lib/paging";
import { DEFAULT_STORY_SORT, type StorySort } from "@/lib/story-sort";

/** Enough room for the current page and two neighbors, without a long run of numbers. */
function visiblePages(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function StoryPagination({
  page,
  pageCount,
  path,
  sort = DEFAULT_STORY_SORT,
}: {
  page: number;
  pageCount: number;
  path: string;
  sort?: StorySort;
}) {
  if (pageCount <= 1) return null;

  const pages = visiblePages(page, pageCount);
  const href = (number: number) => pageHref(path, number, sort);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      <PageLink href={page > 1 ? href(page - 1) : undefined}>Previous</PageLink>
      {pages.map((number) => (
        <PageLink key={number} href={href(number)} current={number === page}>
          {number}
        </PageLink>
      ))}
      <PageLink href={page < pageCount ? href(page + 1) : undefined}>Next</PageLink>
    </nav>
  );
}

function PageLink({
  href,
  current = false,
  children,
}: {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
}) {
  const shape =
    "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold";

  if (current) {
    return (
      <span className={`${shape} bg-ink text-white`} aria-current="page">
        {children}
      </span>
    );
  }

  if (!href) {
    return (
      <span className={`${shape} border border-ink/18 text-pale`} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={`${shape} border border-ink/18 text-muted hover:border-ink/40`}>
      {children}
    </Link>
  );
}
