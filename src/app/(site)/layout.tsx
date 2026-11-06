import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Header and footer wrap every reader-facing page. The admin area sits outside
 * this group so it never renders the public chrome.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <SiteHeader />
      <main className="flex flex-grow flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
