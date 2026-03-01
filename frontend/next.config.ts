import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/slide2", destination: "/problem", permanent: false },
      { source: "/2/slide2", destination: "/problem", permanent: false },
    ];
  },
};

export default nextConfig;
