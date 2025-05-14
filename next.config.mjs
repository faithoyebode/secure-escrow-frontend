/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // We'll gradually migrate components to the app directory
  // while keeping compatibility with the existing structure
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
