import Link from "next/link";
import { ErasIcon, PeopleIcon, PlacesIcon, ScienceIcon } from "@/components/icons";

export const topics = [
  { href: "/explore/people", label: "People", icon: PeopleIcon },
  { href: "/explore/places", label: "Places", icon: PlacesIcon },
  { href: "/explore/eras", label: "Eras", icon: ErasIcon },
  { href: "/explore/science", label: "Science", icon: ScienceIcon },
] as const;

export function TopicTiles() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {topics.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex h-[96px] flex-col items-center justify-center gap-1.5 border border-ink/30 text-rust transition-colors hover:border-rust hover:bg-white/50"
        >
          <Icon />
          <span className="font-serif text-xl leading-none font-bold text-ink">{label}</span>
        </Link>
      ))}
    </div>
  );
}
