import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { site } from "@/lib/site";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
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
