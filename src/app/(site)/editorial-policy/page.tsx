import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/page-header";

export const metadata: Metadata = { title: "Editorial policy", description: "Our standards for historical context, sources, illustrations and corrections." };

export default function EditorialPolicyPage() {
  return <PageShell>
    <PageHeader title="Editorial policy" lede="History needs context, evidence and a clear distinction between records and recreations." />
    <div className="max-w-[720px] space-y-6 text-base leading-relaxed text-body">
      <section><h2 className="font-serif text-2xl font-semibold">What a story should explain</h2><p>Our editorial standard is to explain what happened, what led to it and why it mattered. A date or a dramatic image alone is not enough. Interpretations and disputed details should be distinguished from established facts, with uncertainty stated clearly.</p></section>
      <section><h2 className="font-serif text-2xl font-semibold">Sources and further reading</h2><p>Source lists let readers check claims and explore the subject. Original records, museums, archives and scholarly work should be preferred where available. A source must support the claim it accompanies; adding a link does not replace checking the evidence.</p></section>
      <section><h2 className="font-serif text-2xl font-semibold">Images and AI recreations</h2><p>An AI-generated scene is an illustration, not evidence of how a historical moment looked. Images marked as AI-generated are labeled on the article. Archival images should carry their available credit and context. AI assistance does not remove the need to verify dates, names, quotations and claims.</p></section>
      <section><h2 className="font-serif text-2xl font-semibold">Dates and corrections</h2><p>The event date identifies the historical event. Publication and update dates describe the article on this website. An update date records a saved change, not an independent historical review.</p><p>Older stories are being brought toward these standards. If you find an error or a missing credit, <Link className="mi-link" href="/contact">send a correction</Link> with the article link and supporting evidence.</p></section>
    </div>
  </PageShell>;
}
