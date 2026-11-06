import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/page-header";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact and Corrections",
  description: "Send a historical correction, an image credit or a story suggestion to Past In Frames. We check every report against the sources.",
  path: "/contact",
});

export default function ContactPage() {
  return <PageShell>
    <PageHeader title="Contact and Corrections" lede="Help us make the historical record clearer." />
    <div className="max-w-[640px] space-y-4 text-base leading-relaxed text-body">
      <p>Contact Past In Frames through our <a className="mi-link" href="https://www.facebook.com/profile.php?id=61594799488023" target="_blank" rel="noopener noreferrer">Facebook page</a>.</p>
      <p>For a correction, include the article URL, the passage in question and a reliable source supporting the change. For an image credit or rights question, identify the image and provide its original source.</p>
      <p>Story suggestions and questions about the history behind an article are welcome too.</p>
    </div>
  </PageShell>;
}
