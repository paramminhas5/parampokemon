import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
  },

  // SEO: Security & performance headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Long cache for sprite assets (1 year)
        source: "/sprites/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache AI discoverability files (1 day)
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/humans.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/.well-known/ai-plugin.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        // Cache manifest
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, s-maxage=86400" },
        ],
      },
    ];
  },

  // SEO: Redirects for common alternative URLs
  async redirects() {
    return [
      {
        source: "/cv",
        destination: "/resume",
        permanent: true,
      },
      {
        source: "/game",
        destination: "/play",
        permanent: true,
      },
      {
        source: "/contact",
        destination: "/",
        permanent: true,
      },
      {
        source: "/media",
        destination: "/press",
        permanent: true,
      },
      {
        source: "/news",
        destination: "/press",
        permanent: true,
      },
      {
        source: "/bio",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
