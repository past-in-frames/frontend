import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/page-header";

export const metadata: Metadata = {
  title: "About",
  description:
    "A small daily dose of the strange, the surprising and the true.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader title="About" lede="A small daily dose of the strange, the surprising and the true." />
      <div className="flex max-w-[640px] flex-col gap-4 text-[15px] leading-[1.7] text-body lg:text-[18px] lg:leading-[1.75]">
        <p className="m-0">
          Past In Frames publishes short, well-sourced stories about the odd,
          the overlooked and the quietly astonishing — from deep-sea biology to
          forgotten inventions.
        </p>
        <p className="m-0">
          Each piece is meant to take about five minutes. One curiosity, every
          day, with the sources left in plain sight.
        </p>
      </div>
    </PageShell>
  );
}
