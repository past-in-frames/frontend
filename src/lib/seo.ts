import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Search results cut a description at about 155 characters, so shorter ones are
 * kept whole and longer ones end on a word with an ellipsis.
 */
export function trimDescription(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : cut.length).replace(/[\s,;:–—-]+$/, "")}…`;
}

type PageSeo = {
  /** Shown in the tab and in results. The site name is appended by the title template. */
  title: string;
  description: string;
  /** Path of the canonical address, for example `/explore/people`. */
  path: string;
  /** Pages readers can reach but search results should not list (filters, saved items). */
  noindex?: boolean;
  /** Overrides the site-wide share image. */
  image?: { url: string; alt?: string };
  type?: "website" | "article";
};

/**
 * One place that sets the title, description, canonical address and the Open
 * Graph and Twitter cards together. A page that sets `openGraph` replaces the
 * layout's, so every page has to carry the full set.
 */
export function pageMetadata({ title, description, path, noindex, image, type = "website" }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const text = trimDescription(description);
  // Without a cover of its own, a page shares the site card (src/app/opengraph-image.tsx).
  const shareImage = image ?? { url: absoluteUrl("/opengraph-image"), alt: `${site.name}: On This Day in History` };

  // A title that would be cut off with the site name appended is shown whole instead.
  const fits = title.length + ` — ${site.name}`.length <= 62;

  return {
    title: fits ? title : { absolute: title },
    description: text,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: site.name,
      locale: "en_US",
      title,
      description: text,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: text,
      images: [shareImage.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** The one address search engines should use for the site's own logo and name. */
export const organizationJsonLd = {
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: site.name,
  url: site.url,
  logo: absoluteUrl("/logo.png"),
  sameAs: ["https://www.facebook.com/profile.php?id=61594799488023"],
};

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A listing page: a name, a description and the stories it links to, in order. */
export function collectionPageJsonLd(options: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: options.items.length,
      itemListElement: options.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(item.path),
        name: item.name,
      })),
    },
  };
}
