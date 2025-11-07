import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SessionProviderWrapper } from "@/components/providers/SessionProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "川搭 - 智能衣橱管理系统",
  description: "基于 Next.js 的智能衣橱管理和穿搭推荐系统",
  keywords: ["衣橱管理", "穿搭推荐", "智能搭配", "AI", "时尚"],
  authors: [{ name: "MiniMax Agent" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}