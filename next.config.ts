import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for pino-pretty dependency issue in WalletConnect
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'pino-pretty': false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ignore pino-pretty warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pino\/lib\/tools\.js/ },
      { file: /node_modules\/pino\/lib\/tools\.js/ },
    ];

    return config;
  },
};

export default nextConfig;
