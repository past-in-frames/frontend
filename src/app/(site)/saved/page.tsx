import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/page-header";
import { SavedList } from "./saved-list";

export const metadata: Metadata = {
  title: "Saved",
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <PageShell>
      <PageHeader title="Saved" lede="Stories you saved on this device." />
      <SavedList />
    </PageShell>
  );
}
