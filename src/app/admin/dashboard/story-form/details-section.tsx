"use client";

import { formatEventDate, storyPath } from "@/lib/story-path";
import {
  FormSection,
  Note,
  Segmented,
  SelectField,
  TextAreaField,
  TextField,
} from "./controls";
import { useEditor } from "./editor-context";
import { isCalendarDate, LIMITS } from "./story-validation";

/** The site header links these, and it reads `type` to fill them. */
const SECTIONS = [
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "other", label: "M&I" },
];

export function DetailsSection({ publishedSlug }: { publishedSlug?: string }) {
  const { story, actions, errors } = useEditor();
  const slug = story.slug.trim();
  const path = slug ? storyPath(story.type, slug) : null;
  const slugMoved = Boolean(publishedSlug) && slug !== publishedSlug;
  const knownType = SECTIONS.some((section) => section.value === story.type);

  return (
    <FormSection title="Details">
      <TextField
        label="Title"
        required
        value={story.title}
        onChange={actions.setTitle}
        error={errors.title}
        maxLength={LIMITS.title}
        autoComplete="off"
      />
      <TextAreaField
        label="Summary"
        required
        value={story.summary}
        onChange={(summary) => actions.update({ summary })}
        error={errors.summary}
        maxLength={LIMITS.summary}
        rows={3}
        hint="Shown in listings, search results and social cards."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <TextField
          label="Event date"
          required
          type="date"
          value={story.eventDate}
          onChange={(eventDate) => actions.update({ eventDate })}
          error={errors.eventDate}
          hint={
            isCalendarDate(story.eventDate)
              ? formatEventDate(story.eventDate)
              : undefined
          }
        />
        <SelectField
          label="Section"
          value={story.type}
          onChange={(type) => actions.update({ type })}
          hint="Lists the story under Science, History, or M&I in the site header."
        >
          <option value="">None</option>
          {SECTIONS.map((section) => (
            <option key={section.value} value={section.value}>
              {section.label}
            </option>
          ))}
          {story.type && !knownType ? (
            <option value={story.type}>{story.type}</option>
          ) : null}
        </SelectField>
        <TextField
          label="Subtype"
          value={story.subtype}
          onChange={(subtype) => actions.update({ subtype })}
          autoComplete="off"
          hint="Optional label for your own grouping."
        />
        <TextField
          label="Slug"
          required
          value={story.slug}
          onChange={actions.setSlug}
          error={errors.slug}
          maxLength={LIMITS.slug}
          autoComplete="off"
          spellCheck={false}
          className="lg:col-span-2"
          hint={
            path
              ? `The story will live at ${path}`
              : "Lowercase letters, numbers and hyphens. The address follows the section."
          }
        />
        <Segmented
          label="Status"
          value={story.status}
          onChange={(status) => actions.update({ status })}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
          hint={
            story.status === "published"
              ? "Live on the site, in the sitemap and in search."
              : "Only visible here."
          }
        />
      </div>
      {slugMoved ? (
        <Note tone="warning">
          Saving moves the story to a new address. Links to{" "}
          <span className="font-mono text-xs">{publishedSlug}</span> will stop
          working.
        </Note>
      ) : null}
    </FormSection>
  );
}
