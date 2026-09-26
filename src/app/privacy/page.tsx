import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Past In Frames",
  description: "Privacy Policy for Past In Frames.",
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policy">
      <div className="flex max-w-[640px] flex-col gap-8 text-[15px] leading-[1.7] text-body lg:text-[18px] lg:leading-[1.75]">
        <p className="m-0">
          <span className="font-semibold">Effective date:</span> September 25, 2026
        </p>
        <p className="m-0">
          Past In Frames ([website URL]) is operated by [legal name or business
          name]. This policy explains how we handle information when you visit
          the website.
        </p>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Information we collect
          </h2>
          <p className="m-0">
            You can read our content without creating an account. When you
            visit, our hosting provider may process technical information such
            as your IP address, browser type, pages requested, and access times
            to deliver and protect the website.
          </p>
          <p className="m-0">
            If you email us, we receive the information you choose to provide.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            How we use information
          </h2>
          <p className="m-0">
            We use information to operate and secure the website, respond to
            messages, and understand site performance.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Sharing and retention
          </h2>
          <p className="m-0">
            Service providers may process information on our behalf, such as
            hosting providers. We may also disclose information when required
            by law. We retain information only as long as reasonably needed for
            these purposes or as required by law.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Your choices
          </h2>
          <p className="m-0">
            You can control cookies through your browser settings. To ask about
            information you have provided to us, contact [privacy email].
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Children
          </h2>
          <p className="m-0">
            Past In Frames is intended for a general audience and is not
            directed to children under 13. If you believe a child has provided
            us with personal information, contact [privacy email].
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-serif text-[22px] font-semibold lg:text-[26px]">
            Changes and contact
          </h2>
          <p className="m-0">
            We may update this policy by posting a revised version with a new
            effective date. Questions about privacy can be sent to [privacy
            email].
          </p>
        </section>
      </div>
    </ContentPage>
  );
}
