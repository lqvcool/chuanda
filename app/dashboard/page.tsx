'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Stats {
  totalClothings: number
  totalOutfits: number
  recentOutfits: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalClothings: 0,
    totalOutfits: 0,
    recentOutfits: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      // 获取衣物数量
      const clothingsResponse = await fetch('/api/clothings')
      if (clothingsResponse.ok) {
        const clothings = await clothingsResponse.json()
        setStats(prev => ({ ...prev, totalClothings: clothings.length }))
      }

      // TODO: 获取搭配统计
      // const outfitsResponse = await fetch('/api/outfits')
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">穿衣搭配</h1>
              <nav className="hidden md:flex space-x-8">
                <Link href="/dashboard" className="text-gray-900 hover:text-gray-600 font-medium">
                  首页
                </Link>
                <Link href="/dashboard/clothings" className="text-gray-600 hover:text-gray-900 font-medium">
                  我的衣物
                </Link>
                <Link href="/dashboard/outfits" className="text-gray-600 hover:text-gray-900 font-medium">
                  搭配方案
                </Link>
                <Link href="/dashboard/calendar" className="text-gray-600 hover:text-gray-900 font-medium">
                  穿搭日历
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                欢迎, {session.user?.name}
              </span>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 欢迎区域 */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              欢迎回来，{session.user?.name}！
            </h2>
            <p className="text-gray-600">
              开始管理您的衣橱，发现更多穿搭灵感
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">👔</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">衣物总数</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalClothings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">🎨</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">搭配方案</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalOutfits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">本月穿搭</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.recentOutfits}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
              <div className="space-y-3">
                <Link href="/dashboard/clothings/add">
                  <Button className="w-full justify-start">
                    <span className="mr-2">➕</span>
                    添加新衣物
                  </Button>
                </Link>
                <Link href="/dashboard/outfits/create">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">🎨</span>
                    创建搭配方案
                  </Button>
                </Link>
                <Link href="/dashboard/outfits/suggest">
                  <Button variant="outline" className="w-full justify-start">
                    <span className="mr-2">✨</span>
                    智能搭配推荐
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">最近添加</h3>
              {stats.totalClothings === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">还没有添加任何衣物</p>
                  <Link href="/dashboard/clothings/add">
                    <Button size="sm">添加第一件衣物</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">查看所有衣物</span>
                    <Link href="/dashboard/clothings">
                      <Button variant="ghost" size="sm">
                        查看全部 →
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 功能介绍 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl">📸</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                衣物管理
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                轻松上传和分类管理您的衣物，支持详细的属性信息和标签管理
              </p>
              <Link href="/dashboard/clothings">
                <Button variant="outline" size="sm">开始管理</Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                智能搭配
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                基于颜色、场合、季节等因素，为您推荐最合适的穿搭组合
              </p>
              <Link href="/dashboard/outfits/suggest">
                <Button variant="outline" size="sm">获取推荐</Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                穿搭记录
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                记录日常穿搭，分析穿衣习惯，优化衣橱配置
              </p>
              <Link href="/dashboard/calendar">
                <Button variant="outline" size="sm">查看记录</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}