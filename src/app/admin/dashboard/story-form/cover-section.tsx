"use client";

import { Button, FormSection, Note } from "./controls";
import { useEditor } from "./editor-context";
import { ImageDrop, MediaDetails } from "./media-fields";
import { coverIndex, referencedKeys } from "./story-draft";

/**
 * The home page and category lists show the story's first stored image. That
 * used to be an invisible side effect of media order, so it gets its own card.
 */
export function CoverSection() {
  const { story, actions, coverDraft, openPicker } = useEditor();
  // A row waiting for its upload wins, so replacing a cover happens in place.
  const draft = coverDraft
    ? story.media.findIndex((item) => item.key === coverDraft)
    : -1;
  const index = draft >= 0 ? draft : coverIndex(story.media);
  const cover = index >= 0 ? story.media[index] : undefined;
  const inBody = cover ? referencedKeys(story.body).has(cover.key) : false;

  if (!cover) {
    return (
      <FormSection
        title="Cover"
        description="Shown on the home page and category lists."
      >
        <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
          <ImageDrop createKey={actions.addCover} url="" alt="" />
          <Note>
            Without one, listings fall back to the year of the event. The story&apos;s
            first image counts as the cover, so adding one to the body is enough.
          </Note>
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection
      title="Cover"
      description="Shown on the home page and category lists."
    >
      <div className="grid gap-4 lg:grid-cols-[260px_1fr] lg:items-start">
        <ImageDrop
          mediaKey={cover.key}
          url={cover.url}
          alt={cover.altText}
          actions={
            inBody ? (
              <Button
                size="small"
                variant="quiet"
                onClick={() => openPicker(actions.addCover())}
              >
                Use a different image
              </Button>
            ) : (
              <Button
                size="small"
                variant="danger"
                onClick={() => actions.removeMedia(index)}
              >
                Remove
              </Button>
            )
          }
        />
        <div className="flex flex-col gap-3">
          {inBody ? (
            <Note>
              This image also appears in the body, where its caption and credit
              are edited.
            </Note>
          ) : null}
          <MediaDetails index={index} showCaption={!inBody} showUrl={!inBody} />
        </div>
      </div>
    </FormSection>
  );
}
