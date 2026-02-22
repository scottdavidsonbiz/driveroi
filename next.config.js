/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignore markdown/content folders during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Native modules used in API routes need to be externalized
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js'],
  },
}

module.exports = nextConfig
