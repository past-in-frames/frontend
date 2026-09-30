"use client";

import { Button, FormSection, TextField } from "./controls";
import { useEditor } from "./editor-context";

export function SourcesSection() {
  const { story, actions, errors } = useEditor();

  return (
    <FormSection
      title="Sources"
      description="Listed at the end of the story, in this order."
      actions={
        <Button size="small" onClick={actions.addSource}>
          Add source
        </Button>
      }
    >
      {story.sources.length === 0 ? (
        <p className="m-0 text-sm text-faded">
          No sources yet. Stories read better with the receipts attached.
        </p>
      ) : null}
      {story.sources.map((source, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-2xl border border-ink/10 bg-white p-3 lg:grid-cols-2 lg:p-4"
        >
          <TextField
            label="Title"
            required
            value={source.title}
            onChange={(title) => actions.patchSource(index, { title })}
            error={errors[`sources.${index}.title`]}
            className="lg:col-span-2"
          />
          <TextField
            label="URL"
            required
            value={source.url}
            onChange={(url) => actions.patchSource(index, { url })}
            // A link's host is almost always the publisher, so offer it.
            onBlur={() =>
              actions.patchSource(index, {
                publisher: source.publisher.trim() || hostOf(source.url),
              })
            }
            error={errors[`sources.${index}.url`]}
            placeholder="https://"
          />
          <TextField
            label="Publisher"
            required
            value={source.publisher}
            onChange={(publisher) => actions.patchSource(index, { publisher })}
            error={errors[`sources.${index}.publisher`]}
          />
          <Button
            variant="danger"
            size="small"
            onClick={() => actions.removeSource(index)}
            className="justify-self-start lg:col-span-2"
          >
            Remove source
          </Button>
        </div>
      ))}
    </FormSection>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
