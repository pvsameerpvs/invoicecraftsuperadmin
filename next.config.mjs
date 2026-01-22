/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  experimental: {
    // If you need Server Actions allowed origins, use:
    // serverActions: {
    //   allowedOrigins: ["localhost:3000", "app.localhost:3000", "invoicecraft.com"]
    // }
  },
};

export default nextConfig;
