import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com", "lh3.googleusercontent.com"],
  },
  allowedDevOrigins: ["10.46.36.82"],
};

export default nextConfig;
