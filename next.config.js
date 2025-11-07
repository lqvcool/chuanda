/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用图片优化
  images: {
    domains: ['your-app.vercel.app'], // 替换为你的域名
    unoptimized: true, // Vercel 静态部署需要
  },

  // 优化构建输出
  output: 'standalone', // Vercel 推荐
  experimental: {
    serverComponentsExternalPackages: ['@vercel/postgres'],
  },

  // 编译优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 性能优化
  swcMinify: true,

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // TypeScript 配置
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint 配置
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;