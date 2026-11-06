import Link from "next/link";
import { FacebookIcon, LogoMark } from "@/components/icons";
import { site } from "@/lib/site";

const links = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteFooter() {
  return (
    <footer className="bg-footer text-[#f4efe6]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3" aria-label="Past In Frames home">
            <LogoMark size={36} tone="light" />
            <span className="font-serif text-[28px] leading-none font-bold tracking-[-0.01em]">
              {site.name}
            </span>
          </Link>
          <span aria-hidden="true" className="mx-5 hidden h-12 w-px bg-white/35 md:block" />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] md:ml-auto">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white hover:underline">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/12 pt-4 text-xs text-white/55">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-white">
              Terms
            </Link>
          </span>
          <a
            href="https://www.facebook.com/profile.php?id=61594799488023"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Past In Frames on Facebook"
            className="flex size-[30px] items-center justify-center rounded-full border border-white/25 text-white/70 hover:text-white [&_svg]:stroke-current"
          >
            <FacebookIcon size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
