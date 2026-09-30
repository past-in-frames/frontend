import "server-only";

import { loadAdmin } from "@/lib/admin-proxy";
import type { AdminStory } from "./stories-table";

/**
 * Categories are free text and become part of a story's address, so the editor
 * offers the ones already in use rather than inviting a second spelling.
 */
export async function loadCategories() {
  const result = await loadAdmin<AdminStory[]>("/api/admin/stories");
  if (!result.ok) return [];

  const names = new Set(
    result.data.map((story) => story.category.trim()).filter(Boolean),
  );
  return [...names].sort((first, second) => first.localeCompare(second));
}
