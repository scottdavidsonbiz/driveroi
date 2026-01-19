/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore markdown/content folders during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
