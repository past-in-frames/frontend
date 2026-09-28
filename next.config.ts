import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is its own repository; without this Turbopack walks up to the
  // shared parent folder and writes its build output into a nested directory.
  turbopack: { root: import.meta.dirname },
  // Story images are uploaded to S3 and served through CloudFront.
  images: {
    remotePatterns: [new URL("https://d2jx2whayczcsd.cloudfront.net/**")],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
