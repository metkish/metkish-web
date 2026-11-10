import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 is next/image's own default (every other <Image> on the site
    // relies on it implicitly). 65 is added for the Barcelona hero only
    // (app/barcelona/page.tsx) as a mobile-performance fix -- without
    // explicitly allow-listing it here, Next's image optimizer rejects
    // any ?q= value outside this list with a 400, which would have
    // broken that one image in production.
    qualities: [65, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-639db9eee0bc4d35bfa9f777a62a6f91.r2.dev",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
