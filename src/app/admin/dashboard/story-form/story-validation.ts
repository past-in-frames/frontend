import type { StoryInput, StorySourceInput } from "../story-types";

/** Mirrors the column limits the API enforces, so nothing is typed in vain. */
export const LIMITS = {
  title: 191,
  slug: 191,
  summary: 10000,
  text: 20000,
  url: 512,
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Field path (`title`, `sources.2.url`) to the message shown under the control. */
export type FieldErrors = Record<string, string>;

export function isHttpUrl(value: string) {
  const url = value.trim();
  return /^https?:\/\//.test(url) && url.length <= LIMITS.url;
}

export function isCalendarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** A source row nobody filled in is dropped on save rather than reported. */
export function isBlankSource(source: StorySourceInput) {
  return [source.title, source.url, source.publisher].every(
    (value) => value.trim() === "",
  );
}

/**
 * Repeats the API's rules in the browser so a mistake lands next to the field
 * that caused it instead of arriving as one sentence after a failed save.
 */
export function validateStory(story: StoryInput): FieldErrors {
  const errors: FieldErrors = {};

  const title = story.title.trim();
  if (!title) {
    errors.title = "Give the story a title.";
  } else if (title.length > LIMITS.title) {
    errors.title = `Titles stop at ${LIMITS.title} characters.`;
  }

  const slug = story.slug.trim();
  if (!slug) {
    errors.slug = "The story needs a slug for its address.";
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens.";
  } else if (slug.length > LIMITS.slug) {
    errors.slug = `Slugs stop at ${LIMITS.slug} characters.`;
  }

  if (!story.summary.trim()) {
    errors.summary = "Readers see the summary in listings and search.";
  } else if (story.summary.trim().length > LIMITS.summary) {
    errors.summary = "This summary is too long to store.";
  }

  if (!isCalendarDate(story.eventDate)) {
    errors.eventDate = "Choose the date the event happened.";
  }

  story.media.forEach((item, index) => {
    if (item.url.trim() && !isHttpUrl(item.url)) {
      errors[`media.${index}.url`] = "Links start with http:// or https://.";
    }
  });

  story.sources.forEach((source, index) => {
    if (isBlankSource(source)) return;
    if (!source.title.trim()) {
      errors[`sources.${index}.title`] = "Name the source.";
    }
    if (!isHttpUrl(source.url)) {
      errors[`sources.${index}.url`] = "Links start with http:// or https://.";
    }
    if (!source.publisher.trim()) {
      errors[`sources.${index}.publisher`] = "Add who published it.";
    }
  });

  return errors;
}
