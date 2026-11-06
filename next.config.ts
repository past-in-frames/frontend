import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is its own repository; without this Turbopack walks up to the
  // shared parent folder and writes its build output into a nested directory.
  turbopack: { root: import.meta.dirname },
  // Story images are uploaded to S3 and served through CloudFront.
  images: {
    remotePatterns: [
      new URL("https://d2jx2whayczcsd.cloudfront.net/**"),
      // Thumbnails of the YouTube videos on Watch.
      new URL("https://i.ytimg.com/vi/**"),
    ],
  },
  poweredByHeader: false,
  // Readers mostly arrive from a social link on a phone. Putting the stylesheet in the HTML
  // saves the request that otherwise blocks the first paint.
  experimental: { inlineCss: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The public pages may be framed by this site and by AdSense, whose Ad settings preview
          // loads the site in a frame. No other site can frame them.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://adsense.google.com" },
        ],
      },
      {
        // The editor and the API are never framed, not even by AdSense. A later rule wins for the same header.
        source: "/:area(admin|api)/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
