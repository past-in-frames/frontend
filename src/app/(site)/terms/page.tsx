import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Past In Frames.",
};

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader title="Terms of Use" />
      <div className="flex max-w-[640px] flex-col gap-8 text-[15px] leading-[1.7] text-body lg:text-[18px] lg:leading-[1.75]">
        <p className="m-0">
          <span className="font-semibold">Effective date:</span> September 25, 2026
        </p>
        <p className="m-0">
          Past In Frames ([website URL]) is operated by [legal name or business
          name]. By using this website, you agree to these Terms.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Our content
          </h2>
          <p className="m-0">
            We publish articles and short videos about history and science for
            educational and informational purposes. We strive for accuracy, but
            content may contain errors. Some visuals are AI-generated
            recreations and are not authentic historical footage unless
            expressly identified as such.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Copyright
          </h2>
          <p className="m-0">
            Content on this site may be owned by Past In Frames or third
            parties. You may share links to our pages, but these Terms do not
            grant permission to copy or republish the content.
          </p>
          <p className="m-0">
            If you believe material on this site infringes your copyright,
            email [copyright email] with your contact information,
            identification of your copyrighted work, the URL of the disputed
            material, and an explanation of your concern. We will review the
            report and remove or disable access to material when appropriate.
          </p>
          <p className="m-0">
            For a formal notice under the U.S. Digital Millennium Copyright Act
            (DMCA), include a physical or electronic signature; a good-faith
            statement that the use is not authorized by the copyright owner, its
            agent, or the law; and a statement, under penalty of perjury, that
            the information in the notice is accurate and that you are
            authorized to act for the rights holder.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            External links
          </h2>
          <p className="m-0">
            Our pages may link to third-party websites. We are not responsible
            for their content or practices.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Changes and contact
          </h2>
          <p className="m-0">
            We may update these Terms by posting a revised version with a new
            effective date. For questions, contact [contact email].
          </p>
        </section>
      </div>
    </PageShell>
  );
}
