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
  createdAt: string
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

export default function ClothingsPage() {
  const [clothings, setClothings] = useState<Clothing[]>([])
  const [filteredClothings, setFilteredClothings] = useState<Clothing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSeason, setSelectedSeason] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClothings()
  }, [])

  useEffect(() => {
    filterClothings()
  }, [clothings, selectedCategory, selectedSeason, searchTerm])

  const fetchClothings = async () => {
    try {
      const response = await fetch('/api/clothings')
      if (!response.ok) {
        throw new Error('获取衣物列表失败')
      }
      const data = await response.json()
      setClothings(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取衣物列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const filterClothings = () => {
    let filtered = clothings

    // 按分类筛选
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // 按季节筛选
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(item => item.season === selectedSeason)
    }

    // 按搜索词筛选
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.color.toLowerCase().includes(term) ||
        (item.brand && item.brand.toLowerCase().includes(term)) ||
        (item.tags && item.tags.toLowerCase().includes(term))
      )
    }

    setFilteredClothings(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这件衣物吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/clothings/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      setClothings(prev => prev.filter(item => item.id !== id))
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除失败')
    }
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
          <h1 className="text-3xl font-bold text-gray-900">我的衣物</h1>
          <Link href="/dashboard/clothings/add">
            <Button>添加新衣物</Button>
          </Link>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索衣物名称、颜色、品牌..."
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">全部分类</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                季节
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">全部季节</option>
                {Object.entries(seasonLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedSeason('all')
                  setSearchTerm('')
                }}
                className="w-full"
              >
                清除筛选
              </Button>
            </div>
          </div>
        </div>

        {/* 衣物网格 */}
        {filteredClothings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {clothings.length === 0 ? '还没有添加任何衣物' : '没有找到匹配的衣物'}
            </div>
            {clothings.length === 0 && (
              <Link href="/dashboard/clothings/add">
                <Button>添加第一件衣物</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClothings.map((clothing) => (
              <div key={clothing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={clothing.imageUrl}
                    alt={clothing.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Link href={`/dashboard/clothings/${clothing.id}/edit`}>
                      <Button size="sm" variant="secondary" className="bg-white bg-opacity-90">
                        编辑
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(clothing.id)}
                      className="bg-red-500 bg-opacity-90 hover:bg-red-600"
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{clothing.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>分类:</span>
                      <span>{categoryLabels[clothing.category]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>颜色:</span>
                      <span>{clothing.color}</span>
                    </div>
                    {clothing.brand && (
                      <div className="flex justify-between">
                        <span>品牌:</span>
                        <span>{clothing.brand}</span>
                      </div>
                    )}
                    {clothing.size && (
                      <div className="flex justify-between">
                        <span>尺寸:</span>
                        <span>{clothing.size}</span>
                      </div>
                    )}
                    {clothing.season && (
                      <div className="flex justify-between">
                        <span>季节:</span>
                        <span>{seasonLabels[clothing.season]}</span>
                      </div>
                    )}
                  </div>
                  {clothing.tags && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {clothing.tags.split(',').map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}