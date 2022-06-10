/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  future: { webpack5: true },
  images: {
      domains: ['https://raw.githubusercontent.com/trustwallet/assets/master/blockchains', 'https://assets.coingecko.com/coins/images'],
  }
}

module.exports = nextConfig
