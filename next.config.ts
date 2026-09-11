import path from 'node:path';
import type { NextConfig } from 'next';
import { imageHosts } from './image-hosts.config.mjs';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: imageHosts,
  },
};

export default nextConfig;
