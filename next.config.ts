import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/*": ["./public/evidence/latest.json", "./public/showcase/run.json"],
  },
  // Shareable aliases. /demo alone opens the labelled simulation, so anything
  // pointing at the live treasury needs the query string; these keep it out of
  // posted links. Temporary, so the destination stays free to change.
  async redirects() {
    return [
      { source: "/live", destination: "/demo?live=1", permanent: false },
      {
        source: "/evidence",
        destination: "/demo?evidence=1",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default nextConfig;
