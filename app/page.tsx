'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* 左侧内容区域 */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                穿衣搭配
              </h1>
              <p className="text-xl text-gray-600">
                智能衣橱管理系统
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📸 衣物管理
                </h3>
                <p className="text-gray-600">
                  轻松上传和分类管理您的衣物，包括上衣、裤子、鞋子等
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🎨 智能搭配
                </h3>
                <p className="text-gray-600">
                  基于颜色、场合和季节，为您推荐最合适的穿搭组合
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  📊 穿搭记录
                </h3>
                <p className="text-gray-600">
                  记录您的日常穿搭，分析穿衣习惯和偏好
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full">
                  登录
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  注册新账户
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 右侧装饰区域 */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-8">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-6xl">👔</span>
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  让每一天的穿搭都充满灵感
                </h2>
                <p className="text-xl opacity-90">
                  用科技重新定义您的衣橱管理体验
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}