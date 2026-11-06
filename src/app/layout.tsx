import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { absoluteUrl, site } from "@/lib/site";
import "./globals.css";

/**
 * Source Serif 4 and Source Sans 3 are variable fonts, so one file per script covers
 * every weight; listing weights or an italic would download a file for each.
 * Italic text (the "Illustration" label) is drawn slanted by the browser instead.
 */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

/** Not variable, so only the two weights the design uses: semibold and bold. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — On This Day in History`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["on this day in history", "today in history", "historical events", "history stories", "anniversaries"],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  // Lets search engines show large previews and full snippets of the stories.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: `${site.name} — On This Day in History`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — On This Day in History`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f3ea",
  width: "device-width",
  initialScale: 1,
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationJsonLd,
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": absoluteUrl("/#organization") },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${site.url}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

/** Development page views are not real traffic, so they stay out of Analytics. */
const analytics = process.env.NODE_ENV === "production";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${plexMono.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4974891755070728"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-cream font-sans text-ink">
        <JsonLd data={siteJsonLd} />
        {children}
        {/* gtag.js appends its own tags to <head>, so it has to be injected
            outside the tree React hydrates. */}
        {analytics ? (
          <>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-W3QTDWTHDG" />
            <Script id="gtag-init">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-W3QTDWTHDG');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
