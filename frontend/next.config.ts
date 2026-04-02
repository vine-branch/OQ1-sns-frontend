import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "framer-motion"],
  },
  images: {
    remotePatterns: [
      // 카카오 프로필 이미지가 http로 깨지는 이슈 수정
      { protocol: "http", hostname: "*.kakaocdn.net" },
      { protocol: "https", hostname: "*.kakaocdn.net" },
    ],
  },
};

export default withSerwist(nextConfig);
