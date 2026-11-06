import Image from "next/image";
import type { ReactNode } from "react";

/** The shared rust call to action. Anything styled orange in this design is one of these. */
export const rustButtonClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 bg-rust px-6 font-serif text-[17px] text-white transition-colors hover:bg-accent-2-dark";

export const outlineButtonClass =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-rust px-5 font-serif text-[17px] text-rust transition-colors hover:bg-rust hover:text-white";

/** Section title with a hairline running out to the right edge. */
export function SectionHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className="flex items-center gap-5">
      <h2 id={id} className="m-0 font-serif text-[30px] leading-[1.1] font-bold tracking-[-0.01em] sm:text-[36px]">
        {children}
      </h2>
      <span aria-hidden="true" className="mt-2 h-px min-w-6 flex-1 bg-ink/45" />
    </div>
  );
}

/** Small monospaced label: dates, years, eyebrows. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[15px] font-semibold tracking-[0.12em] text-rust uppercase ${className}`}>
      {children}
    </span>
  );
}

/**
 * A cover picture at a fixed shape. AI illustrations carry an "Illustration"
 * label so nobody mistakes them for archival photographs.
 */
export function Cover({
  src,
  alt,
  sizes,
  aspect,
  illustration = false,
  priority = false,
  children,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  /** Tailwind aspect class, for example `aspect-[2/1]`. */
  aspect: string;
  illustration?: boolean;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-ink/10 ${aspect}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover"
        />
      ) : null}
      {illustration && src ? (
        <span className="absolute bottom-2 left-3 font-serif text-sm text-white italic [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
          Illustration
        </span>
      ) : null}
      {children}
    </div>
  );
}
