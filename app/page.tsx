'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalClothings: 0,
    totalOutfits: 0,
    totalUsers: 1
  })

  useEffect(() => {
    if (status === 'authenticated') {
      // 获取统计数据
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      // 这里会调用 API 获取统计数据
      setStats({
        totalClothings: 0,
        totalOutfits: 0,
        totalUsers: 1
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-skeleton h-8 w-8 rounded-full"></div>
      </div>
    )
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">川搭</h1>
                <span className="ml-2 text-sm text-gray-500">智能衣橱管理</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">欢迎，{session.user?.name}</span>
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  进入仪表板
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              欢迎回到你的智能衣橱
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              轻松管理你的衣物，获取智能穿搭建议，让每天的搭配都完美无误。
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalClothings}
                </div>
                <div className="text-gray-600">衣物总数</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.totalOutfits}
                </div>
                <div className="text-gray-600">搭配方案</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.totalUsers}
                </div>
                <div className="text-gray-600">搭配记录</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/clothings" className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">👔</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">管理衣物</h3>
                  <p className="text-gray-600">
                    上传、编辑和管理你的所有衣物
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/outfits" className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">智能搭配</h3>
                  <p className="text-gray-600">
                    获取个性化的穿搭建议和搭配方案
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">川搭</h1>
              <span className="ml-2 text-sm text-gray-500">智能衣橱管理</span>
            </div>
            <button
              onClick={() => signIn()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            智能衣橱管理系统
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            基于 AI 的个性化穿搭推荐，让你的每一天都时尚精彩。轻松管理衣物，智能搭配方案，个性化推荐服务。
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => signIn()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              立即开始
            </button>
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg"
            >
              注册账户
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">智能管理</h3>
              <p className="text-gray-600">
                一键上传衣物信息，智能分类管理，让衣橱整理变得简单
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI 推荐</h3>
              <p className="text-gray-600">
                基于颜色搭配、场合适配和季节考虑，智能推荐完美搭配
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">数据分析</h3>
              <p className="text-gray-600">
                详细的穿搭统计和分析，帮助你了解搭配习惯和偏好
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">技术特性</h3>
          <div className="flex justify-center flex-wrap gap-4">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              Next.js 14
            </span>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              TypeScript
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
              Tailwind CSS
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
              Vercel Postgres
            </span>
            <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
              NextAuth.js
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}