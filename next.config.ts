import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper static export
  distDir: undefined, // Let Next.js use default
  // Disable server-side features
  // Remove experimental.esmExternals as it's causing warnings
  // Ensure proper asset handling
  assetPrefix: '',
  basePath: '',
  // Fix workspace root warning
  outputFileTracingRoot: undefined,
  // Optimize Fast Refresh performance
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'react', 'react-dom'],
  },
  // Improve HMR performance
  webpack: (config, { dev }) => {
    if (dev) {
      // Optimize for development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      // Reduce bundle analysis overhead
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
      // Disable source maps in development for faster builds
      config.devtool = false;
    }
    return config;
  },
}

export default nextConfig;
