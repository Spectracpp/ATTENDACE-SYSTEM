/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000'
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig;
