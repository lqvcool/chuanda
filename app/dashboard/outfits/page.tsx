'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface Clothing {
  id: string
  name: string
  category: string
  color: string
  brand?: string
  size?: string
  season?: string
  tags?: string
  imageUrl: string
}

interface OutfitItem {
  id: string
  clothing: Clothing
}

interface Outfit {
  id: string
  name: string
  description?: string
  occasion?: string
  season?: string
  createdAt: string
  items: OutfitItem[]
}

const categoryLabels: { [key: string]: string } = {
  TOP: '上衣',
  BOTTOM: '裤子',
  DRESS: '裙子',
  SHOES: '鞋子',
  HAT: '帽子',
  ACCESSORY: '配饰',
  OUTERWEAR: '外套',
  UNDERWEAR: '内衣',
  SOCKS: '袜子',
  BAG: '包包'
}

const seasonLabels: { [key: string]: string } = {
  SPRING: '春季',
  SUMMER: '夏季',
  AUTUMN: '秋季',
  WINTER: '冬季',
  ALL_SEASON: '四季'
}

const occasionLabels: { [key: string]: string } = {
  casual: '休闲',
  formal: '正式',
  business: '商务',
  sport: '运动'
}

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchOutfits()
  }, [currentPage])

  const fetchOutfits = async () => {
    try {
      const response = await fetch(`/api/outfits?page=${currentPage}&limit=12`)
      if (!response.ok) {
        throw new Error('获取搭配方案失败')
      }
      const data = await response.json()
      setOutfits(data.outfits)
      setTotalPages(data.totalPages)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取搭配方案失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个搭配方案吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/outfits/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      setOutfits(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除失败')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题和操作 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的搭配方案</h1>
            <p className="text-gray-600 mt-2">
              管理和查看您的所有穿搭搭配
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/dashboard/outfits/suggest">
              <Button variant="outline">
                智能推荐
              </Button>
            </Link>
            <Link href="/dashboard/outfits/create">
              <Button>
                创建搭配
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* 搭配方案列表 */}
        {outfits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              还没有创建任何搭配方案
            </div>
            <div className="space-x-4">
              <Link href="/dashboard/outfits/suggest">
                <Button variant="outline">获取智能推荐</Button>
              </Link>
              <Link href="/dashboard/outfits/create">
                <Button>手动创建搭配</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <div key={outfit.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {outfit.name}
                      </h3>
                      {outfit.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {outfit.description}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/outfits/${outfit.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          编辑
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(outfit.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {outfit.occasion && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {occasionLabels[outfit.occasion as keyof typeof occasionLabels] || outfit.occasion}
                      </span>
                    )}
                    {outfit.season && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {seasonLabels[outfit.season]}
                      </span>
                    )}
                  </div>

                  {/* 衣物展示 */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {outfit.items.map((item) => (
                      <div key={item.id} className="text-center">
                        <div className="aspect-square relative mb-1">
                          <img
                            src={item.clothing.imageUrl}
                            alt={item.clothing.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {item.clothing.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {categoryLabels[item.clothing.category]}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 创建时间 */}
                  <div className="text-xs text-gray-500">
                    创建于 {new Date(outfit.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}