import Link from "next/link";
import { InstagramIcon, LogoMark, TwitterIcon } from "@/components/icons";
import { site } from "@/lib/site";

const legalLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="flex flex-col justify-between gap-6 border-t border-ink/12 px-[18px] pt-8 pb-7 lg:gap-10 lg:px-16 lg:pt-12 lg:pb-10">
      <div className="flex flex-col justify-between gap-8 lg:flex-row">
        <div className="hidden max-w-[300px] flex-col gap-3.5 lg:flex">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-serif text-[17px] font-semibold">{site.name}</span>
          </div>
          <p className="m-0 text-sm leading-relaxed text-faded">
            A small daily dose of the strange, the surprising and the true.
          </p>
        </div>
        <nav className="flex flex-col gap-2.5 lg:gap-3">
          <span className="text-xs font-bold tracking-[0.06em] text-pale uppercase lg:text-[13px]">
            Site
          </span>
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center justify-between border-t border-ink/8 pt-[18px] lg:pt-6">
        <span className="text-xs text-pale lg:text-[13px]">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
        <div className="flex gap-2.5 lg:gap-3.5">
          <span className="hidden size-[34px] items-center justify-center rounded-full border border-ink/14 lg:flex">
            <TwitterIcon />
          </span>
          <span className="flex size-[30px] items-center justify-center rounded-full border border-ink/14 lg:size-[34px]">
            <InstagramIcon size={13} />
          </span>
        </div>
      </div>
    </footer>
  );
}
