import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: false,
    serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
