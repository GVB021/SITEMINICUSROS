import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactCompiler: true,
  typescript: {
    // Permitir build sem tipos do Supabase (antes de configurar)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
