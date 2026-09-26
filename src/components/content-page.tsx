import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function ContentPage({
  title,
  lede,
  children,
}: {
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <SiteHeader />
      <main className="flex flex-grow flex-col gap-8 px-[18px] pt-8 pb-12 lg:gap-10 lg:px-16 lg:pt-16 lg:pb-16">
        <div className="flex max-w-[720px] flex-col gap-3">
          <h1 className="m-0 font-serif text-[34px] leading-[1.08] font-semibold tracking-[-0.01em] lg:text-5xl lg:leading-[1.08]">
            {title}
          </h1>
          {lede ? (
            <p className="m-0 text-[15px] leading-[1.55] text-muted lg:text-[18px] lg:leading-relaxed">
              {lede}
            </p>
          ) : null}
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
