export type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string };

/** A YouTube Short is stored with a /shorts/ link and is shown upright, 9:16. */
export function isShortUrl(url: string) {
  try {
    return /^\/shorts\//.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

/** The 11-character id of a YouTube watch, share, shorts or embed link, or null for anything else. */
export function youtubeId(url: string): string | null {
  const source = videoSource(url);
  if (source.kind !== "embed") return null;
  return /youtube-nocookie\.com\/embed\/([\w-]+)/.exec(source.src)?.[1] ?? null;
}

/** YouTube and Vimeo pages become embeds, video files play inline, anything else stays a link. */
export function videoSource(url: string): VideoSource {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: "link", src: url };
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const youtube =
    host === "youtu.be"
      ? parsed.pathname.slice(1)
      : host === "youtube.com" || host === "m.youtube.com"
        ? (parsed.searchParams.get("v") ?? /^\/(?:shorts|embed)\/([\w-]+)/.exec(parsed.pathname)?.[1])
        : undefined;
  if (youtube && /^[\w-]{6,}$/.test(youtube)) {
    return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${youtube}` };
  }

  const vimeo = host === "vimeo.com" ? /^\/(\d+)/.exec(parsed.pathname)?.[1] : undefined;
  if (vimeo) return { kind: "embed", src: `https://player.vimeo.com/video/${vimeo}` };

  if (/\.(mp4|webm|mov)$/i.test(parsed.pathname)) return { kind: "file", src: url };
  return { kind: "link", src: url };
}
