export function categorySlug(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function storyPath(category: string, slug: string) {
  return `/category/${categorySlug(category)}/${slug}`;
}
