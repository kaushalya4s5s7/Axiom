import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  
 transpilePackages: ['motion','@splinetool/react-spline'],
  experimental: {
    esmExternals: 'loose'
  } ,
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com", "assets.aceternity.com","img.freepik.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
