import type { StoryInput } from "../story-types";

/** Advisory checks support a human review; passing them cannot certify quality. */
export function EditorialReview({ story }: { story: StoryInput }) {
  const paragraphs = story.body.filter((block) => block.type === "paragraph" && block.text.trim());
  const sources = story.sources.filter((source) => source.title.trim() && source.publisher.trim() && /^https?:\/\//.test(source.url));
  const images = story.media.filter((item) => item.type === "image" && item.url.trim());
  const checks = [
    { label: "Article body is present", ok: paragraphs.length > 0 },
    { label: "Supporting sources are linked", ok: sources.length > 0 },
    { label: "Images have descriptive alt text", ok: images.every((item) => item.altText.trim()) },
    { label: "Images have context or credit", ok: images.every((item) => item.caption.trim() || item.credit.trim()) },
    { label: "Image blocks refer to uploaded images", ok: story.body.every((block) => block.type !== "image" || images.some((item) => item.key === block.mediaKey)) },
  ];
  return <section className="rounded-xl border border-ink/15 p-5" aria-label="Editorial review">
    <h2 className="m-0 font-serif text-xl font-semibold">Before publishing</h2>
    <p className="text-sm text-muted">These checks are advisory. Review the evidence and the article yourself before publishing.</p>
    <ul className="space-y-1 text-sm">{checks.map((check) => <li key={check.label}>{check.ok ? "✓" : "Needs attention:"} {check.label}</li>)}</ul>
    <p className="text-sm text-muted">Check dates and names against the sources. Explain causes, consequences and disputed details. Mark every AI illustration in its media settings, and confirm permission and credit for archival images.</p>
  </section>;
}
