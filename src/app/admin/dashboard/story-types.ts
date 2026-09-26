export type StoryBlockInput =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "image"; mediaKey: string };

export type StoryMediaInput = {
  key: string;
  type: "image" | "video";
  url: string;
  altText: string;
  caption: string;
  credit: string;
  isAiGenerated: boolean;
};

export type StorySourceInput = {
  title: string;
  url: string;
  publisher: string;
};

export type StoryInput = {
  slug: string;
  title: string;
  summary: string;
  eventDate: string;
  category: string;
  status: "draft" | "published";
  type: string;
  subtype: string;
  body: StoryBlockInput[];
  media: StoryMediaInput[];
  sources: StorySourceInput[];
};

export function blankStory(): StoryInput {
  return {
    slug: "",
    title: "",
    summary: "",
    eventDate: "",
    category: "",
    status: "draft",
    type: "",
    subtype: "",
    body: [{ type: "paragraph", text: "" }],
    media: [],
    sources: [],
  };
}
