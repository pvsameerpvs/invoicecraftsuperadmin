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
    // Allow app.localhost, *.localhost
    allowedDevOrigins: [
        "localhost:3000",
        "app.localhost:3000",
        "invoicecraft.com"
    ],
  },
};

export default nextConfig;
