"use client";

import { createContext, useContext } from "react";
import type { StoryInput } from "../story-types";
import type { DraftActions } from "./story-draft";
import type { FieldErrors } from "./story-validation";

export type EditorValue = {
  story: StoryInput;
  actions: DraftActions;
  /** Only the errors worth showing yet — empty until the first save attempt. */
  errors: FieldErrors;
  /** Media row claimed by the cover card while it waits for an image. */
  coverDraft: string;
  /** Media key currently being uploaded, so only that control shows progress. */
  uploadingKey: string | null;
  openPicker: (mediaKey: string) => void;
  uploadFile: (mediaKey: string, file: File) => void;
};

export const EditorContext = createContext<EditorValue | null>(null);

export function useEditor() {
  const value = useContext(EditorContext);
  if (!value) {
    throw new Error("Story form sections must render inside <StoryForm>");
  }
  return value;
}
