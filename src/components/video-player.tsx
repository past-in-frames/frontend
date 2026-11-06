"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayBadge } from "@/components/icons";

/**
 * A YouTube video that costs nothing until it is played: a thumbnail with a play
 * button, which swaps for the real player (and starts it) on click. This keeps
 * YouTube's scripts and cookies off the page for readers who never press play.
 */
export function VideoPlayer({
  videoId,
  title,
  sizes = "(min-width: 1200px) 520px, (min-width: 768px) 45vw, 100vw",
  vertical = false,
  className = "",
}: {
  videoId: string;
  title: string;
  sizes?: string;
  /** A Short: shown upright at 9:16 with its own portrait thumbnail. */
  vertical?: boolean;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  // Not every video has the best thumbnail, so fall back to the next one, ending with the one that always exists.
  const thumbs = vertical ? ["oar2", "maxresdefault", "hqdefault"] : ["maxresdefault", "hqdefault"];
  const [thumbIndex, setThumbIndex] = useState(0);
  const thumb = thumbs[thumbIndex];

  return (
    <div className={`relative w-full overflow-hidden bg-ink ${vertical ? "aspect-[9/16]" : "aspect-video"} ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer"
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/${thumb}.jpg`}
            alt=""
            fill
            sizes={sizes}
            className="object-cover"
            onError={() => setThumbIndex((index) => Math.min(index + 1, thumbs.length - 1))}
          />
          <span className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-110">
            <PlayBadge size={vertical ? 48 : 56} />
          </span>
        </button>
      )}
    </div>
  );
}
