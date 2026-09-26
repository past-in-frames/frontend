import Link from "next/link";
import { InstagramIcon, LogoMark, TwitterIcon } from "@/components/icons";

type SiteFooterProps = {
  variant?: "full" | "simple";
};

export function SiteFooter({ variant = "full" }: SiteFooterProps) {
  if (variant === "simple") {
    return (
      <footer className="flex flex-col items-start gap-3 border-t border-ink/12 px-[18px] py-7 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-10">
        <span className="text-xs text-pale lg:text-[13px]">
          © 2026 Past In Frames. All rights reserved.
        </span>
        <div className="flex gap-[18px] lg:gap-6">
          <Link href="/privacy" className="text-[13px] text-muted">
            Privacy
          </Link>
          <Link href="/terms" className="text-[13px] text-muted">
            Terms
          </Link>
          <Link href="#" className="text-[13px] text-muted">
            Contact
          </Link>
        </div>
      </footer>
    );
  }

  return (
    <footer
      id="about"
      className="flex flex-col justify-between gap-6 border-t border-ink/12 px-[18px] pb-7 pt-8 lg:gap-10 lg:px-16 lg:pb-10 lg:pt-12"
    >
      <div className="flex flex-col justify-between gap-10 lg:flex-row">
        <div className="hidden max-w-[300px] flex-col gap-3.5 lg:flex">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-serif text-[17px] font-semibold">
              Past In Frames
            </span>
          </div>
          <p className="m-0 text-sm leading-relaxed text-faded">
            A small daily dose of the strange, the surprising and the true.
          </p>
        </div>
        <div className="flex gap-10 lg:gap-16">
          <FooterCol
            title="Company"
            links={[
              { href: "/about", label: "About" },
              { href: "#", label: "Contact" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { href: "/privacy", label: "Privacy" },
              { href: "/terms", label: "Terms" },
            ]}
            className="hidden lg:flex"
          />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-ink/8 pt-[18px] lg:pt-6">
        <span className="text-xs text-pale lg:text-[13px]">
          <span className="lg:hidden">© 2026 Past In Frames</span>
          <span className="hidden lg:inline">
            © 2026 Past In Frames. All rights reserved.
          </span>
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

function FooterCol({
  title,
  links,
  className = "",
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2.5 lg:gap-3 ${className}`}>
      <span className="text-xs font-bold tracking-[0.06em] text-pale uppercase lg:text-[13px]">
        {title}
      </span>
      {links.map((link) => (
        <Link key={link.label} href={link.href} className="text-sm text-muted">
          {link.label}
        </Link>
      ))}
    </div>
  );
}
