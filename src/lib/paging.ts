export const HOME_PAGE_SIZE = 20;
export const CATEGORY_PAGE_SIZE = 12;

/** Page 1 keeps the clean category URL; later pages add `?page=`. */
export function categoryPageHref(path: string, page: number) {
  return page <= 1 ? path : `${path}?page=${page}`;
}

/**
 * Missing `page` is the first page. `?page=1`, zero, and junk redirect back to
 * the clean URL so the canonical address stays one.
 */
export function parsePageParam(value: string | string[] | undefined) {
  if (value === undefined) return { page: 1, redirectToFirst: false };
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return { page: 1, redirectToFirst: true };
  const page = Number(raw);
  if (page <= 1) return { page: 1, redirectToFirst: true };
  return { page, redirectToFirst: false };
}
