"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { storyPath } from "@/lib/story-path";
import type { StoryInput } from "../story-types";
import { BodySection } from "./body-section";
import { Button } from "./controls";
import { CoverSection } from "./cover-section";
import { DetailsSection } from "./details-section";
import { EditorContext } from "./editor-context";
import { MediaSection } from "./media-section";
import { SourcesSection } from "./sources-section";
import { cleanStory, useStoryDraft } from "./story-draft";
import { validateStory } from "./story-validation";

const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

/** What the API currently holds, which is not always what is on screen. */
type Stored = { slug: string; status: string; category: string };

export function StoryForm({
  mode,
  initial,
  originalSlug,
  categories,
}: {
  mode: "create" | "edit";
  initial: StoryInput;
  originalSlug?: string;
  categories: string[];
}) {
  const router = useRouter();
  const { story, actions, coverDraft, dirty, markSaved } = useStoryDraft(
    initial,
    mode,
  );
  const [stored, setStored] = useState<Stored | null>(
    originalSlug
      ? {
          slug: originalSlug,
          status: initial.status,
          category: initial.category,
        }
      : null,
  );
  const [pending, setPending] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  // Field errors stay hidden until the first save, then track every keystroke.
  const [checked, setChecked] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef("");

  const problems = validateStory(story);
  const problemCount = Object.keys(problems).length;

  // Closing the tab mid-edit is the one way to lose work the form cannot undo.
  useEffect(() => {
    if (!dirty) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (problemCount > 0) {
      setChecked(true);
      setError("");
      setTimeout(showFirstProblem, 0);
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch(
        stored
          ? `/api/admin/stories/${encodeURIComponent(stored.slug)}`
          : "/api/admin/stories",
        {
          method: stored ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanStory(story)),
        },
      );
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError(await readError(response, "Couldn't save the story"));
        return;
      }

      const saved = (await response.json()) as StoryInput;
      markSaved(saved);
      setChecked(false);
      setStored({
        slug: saved.slug,
        status: saved.status,
        category: saved.category,
      });
      // The dashboard list is rendered on the server, so it needs the news.
      router.refresh();
      if (saved.slug !== stored?.slug) {
        router.replace(
          `/admin/dashboard/${encodeURIComponent(saved.slug)}/edit`,
        );
      }
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!stored || pending) return;
    setPending(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/stories/${encodeURIComponent(stored.slug)}`,
        { method: "DELETE" },
      );
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError(await readError(response, "Couldn't delete the story"));
        setConfirmingDelete(false);
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setPending(false);
    }
  }

  function showFirstProblem() {
    const field = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    field?.scrollIntoView({ block: "center", behavior: "smooth" });
    field?.focus({ preventScroll: true });
  }

  function openPicker(mediaKey: string) {
    if (!mediaKey) return;
    uploadTarget.current = mediaKey;
    fileRef.current?.click();
  }

  function onFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadFile(uploadTarget.current, file);
  }

  async function uploadFile(mediaKey: string, file: File) {
    if (!mediaKey || uploadingKey) return;
    setUploadingKey(mediaKey);
    setError("");

    try {
      const body = new FormData();
      body.append("file", file, file.name);
      body.append("mediaKey", mediaKey);
      // Attaching to a stored story keeps the image if the draft is abandoned.
      if (stored) body.append("slug", stored.slug);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) {
        setError(await readError(response, "Couldn't upload the image"));
        return;
      }

      const uploaded = (await response.json()) as { url?: string };
      if (!uploaded.url) {
        setError("Couldn't upload the image");
        return;
      }
      actions.setMediaUrl(mediaKey, uploaded.url);
    } catch {
      setError("Couldn't reach the server");
    } finally {
      setUploadingKey(null);
    }
  }

  const liveUrl =
    stored?.status === "published"
      ? storyPath(stored.category, stored.slug)
      : null;

  return (
    <EditorContext
      value={{
        story,
        actions,
        errors: checked ? problems : {},
        categories,
        coverDraft,
        uploadingKey,
        openPicker,
        uploadFile,
      }}
    >
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_TYPES}
          onChange={onFilePicked}
          className="hidden"
        />

        <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-ink/10 bg-cream/95 px-[18px] py-3 backdrop-blur lg:px-16">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/admin/dashboard"
              onNavigate={(event) => {
                if (dirty && !window.confirm(LEAVE_WARNING)) {
                  event.preventDefault();
                }
              }}
              className="text-sm font-semibold text-accent-2"
            >
              ← Dashboard
            </Link>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-serif text-lg font-semibold">
                {story.title || (mode === "create" ? "New story" : "Untitled")}
              </span>
              <span className="text-[13px] text-faded">
                {pending
                  ? "Saving…"
                  : dirty
                    ? "Unsaved changes"
                    : stored
                      ? "All changes saved"
                      : "Nothing saved yet"}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] uppercase lg:inline ${
                  story.status === "published"
                    ? "bg-teal-deep/10 text-teal-deep"
                    : "bg-accent/20 text-muted"
                }`}
              >
                {story.status}
              </span>
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-accent-2"
                >
                  View live ↗
                </a>
              ) : null}
              {stored ? (
                <Button
                  variant="danger"
                  onClick={() => setConfirmingDelete(true)}
                  disabled={pending}
                >
                  Delete
                </Button>
              ) : null}
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>

          {confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-rust/10 px-3 py-2 text-[13px] font-semibold text-muted">
              Delete “{story.title || stored?.slug}” and everything in it?
              <Button
                size="small"
                variant="danger"
                onClick={onDelete}
                disabled={pending}
              >
                Delete for good
              </Button>
              <Button
                size="small"
                variant="quiet"
                onClick={() => setConfirmingDelete(false)}
              >
                Keep it
              </Button>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="m-0 rounded-[10px] bg-rust/10 px-3 py-2 text-[13px] font-semibold text-rust"
            >
              {error}
            </p>
          ) : null}

          {checked && problemCount > 0 ? (
            <p
              role="alert"
              className="m-0 flex items-center gap-2 rounded-[10px] bg-accent/20 px-3 py-2 text-[13px] font-semibold text-muted"
            >
              {problemCount === 1
                ? "One field needs attention."
                : `${problemCount} fields need attention.`}
              <Button size="small" variant="quiet" onClick={showFirstProblem}>
                Show me
              </Button>
            </p>
          ) : null}
        </header>

        <div className="flex max-w-4xl flex-col gap-5 px-[18px] py-6 lg:px-16 lg:py-10">
          <DetailsSection publishedSlug={stored?.slug} />
          <CoverSection />
          <BodySection />
          <MediaSection />
          <SourcesSection />
        </div>
      </form>
    </EditorContext>
  );
}

const LEAVE_WARNING = "Leave without saving? Your changes will be lost.";

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message ?? fallback;
}
