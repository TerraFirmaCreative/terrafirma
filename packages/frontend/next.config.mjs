/** @type {import('next').NextConfig} */

import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin"

const nextConfig = {
  webpack: (config, {isServer} ) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'terrafirm-images.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  ...!["vercel", "local"].includes(process.env.DEPLOY_ENV) && {output: "standalone"},
};

export default nextConfig;
