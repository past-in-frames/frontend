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
  status: "draft" | "published";
  type: string;
  subtype: string;
  /** `us`, `world` or empty. Feeds the U.S. and World filters on On This Day. */
  region: string;
  /** `people`, `places` and `eras`; science is a section. */
  topics: string[];
  /** Eligible for "The Story Behind the Photo" on the home page. */
  isPhotoStory: boolean;
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
    status: "draft",
    type: "",
    subtype: "",
    region: "",
    topics: [],
    isPhotoStory: false,
    body: [{ type: "paragraph", text: "" }],
    media: [],
    sources: [],
  };
}
