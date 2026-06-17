/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      { protocol: 'https', hostname: 'imaz.bf' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'pdfmake', 'sharp'],
  },
}

module.exports = nextConfig
