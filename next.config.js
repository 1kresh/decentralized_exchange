/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  future: { webpack5: true },
  images: {
    domains: [
      "raw.githubusercontent.com",
      "assets.coingecko.com",
      "cloudflare-ipfs.com",
    ],
  },
};

module.exports = nextConfig;
