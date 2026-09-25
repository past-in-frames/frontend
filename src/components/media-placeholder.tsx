import { ImageIcon } from "@/components/icons";

type MediaPlaceholderProps = {
  label?: string;
  gradient: string;
  className?: string;
  iconSize?: number;
};

export function MediaPlaceholder({
  label,
  gradient,
  className = "",
  iconSize = 30,
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative flex w-full items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      <ImageIcon size={iconSize} />
      {label ? (
        <span className="absolute bottom-2.5 left-3 text-[10px] font-semibold tracking-[0.04em] text-cream/75 lg:bottom-3 lg:left-3.5 lg:text-[11px]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
