"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons";

export function VideoBlock() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-2 lg:gap-2.5">
      <div className="relative flex h-[210px] items-center justify-center overflow-hidden rounded-2xl bg-video lg:h-[438px] lg:rounded-[18px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent-2) 35%, transparent), color-mix(in srgb, var(--video) 85%, transparent))",
          }}
        />
        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={() => setPlaying((value) => !value)}
          className="relative flex size-[60px] items-center justify-center rounded-full bg-cream/95 lg:size-[76px]"
        >
          <PlayIcon size={20} />
        </button>
        <span className="absolute bottom-2.5 left-3.5 text-[11px] font-semibold text-cream/85 lg:bottom-4 lg:left-5 lg:text-xs">
          {playing
            ? "VIDEO — Playing visualization"
            : "VIDEO — Ring rain, visualized (2:14)"}
        </span>
        <span className="absolute right-3.5 bottom-2.5 font-sans text-[11px] text-cream/70 lg:right-5 lg:bottom-4 lg:text-xs">
          2:14
        </span>
      </div>
      <span className="text-xs text-faded lg:text-[13px]">
        A NASA visualization of ring particles falling into Saturn&apos;s
        atmosphere.
      </span>
    </div>
  );
}
