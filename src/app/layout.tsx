import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { site } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-W3QTDWTHDG" />
        <Script id="gtag-init">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-W3QTDWTHDG');`}
        </Script>
      </body>
    </html>
  );
}
