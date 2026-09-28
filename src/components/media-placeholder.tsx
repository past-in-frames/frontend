import { ImageIcon } from "@/components/icons";

type MediaPlaceholderProps = {
  gradient: string;
  className?: string;
  iconSize?: number;
};

/** Shown when a story has no cover image yet. */
export function MediaPlaceholder({
  gradient,
  className = "",
  iconSize = 30,
}: MediaPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`flex w-full items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      <ImageIcon size={iconSize} />
    </div>
  );
}
