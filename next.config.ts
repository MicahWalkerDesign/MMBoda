import type { NextConfig } from "next";

// When deployed via GitHub Actions, GitHub Pages serves the site at /<repo>/.
// Set NEXT_PUBLIC_BASE_PATH (or rely on the default) so assets and links resolve correctly.
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/MMBoda" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
