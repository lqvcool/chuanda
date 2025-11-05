'use client'

import { useState } from 'react'
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

interface OutfitSuggestion {
  id: string
  name: string
  items: Clothing[]
  occasion: string
  season: string
  reason: string
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

export default function OutfitSuggestPage() {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalClothings, setTotalClothings] = useState(0)

  const [filters, setFilters] = useState({
    occasion: '',
    season: '',
    colorPreference: ''
  })

  const generateSuggestions = async () => {
    setIsLoading(true)
    setError('')
    setSuggestions([])

    try {
      const response = await fetch('/api/outfits/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成搭配建议失败')
      }

      setSuggestions(data.suggestions)
      setTotalClothings(data.totalClothings)
    } catch (error) {
      setError(error instanceof Error ? error.message : '生成搭配建议失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveOutfit = async (suggestion: OutfitSuggestion) => {
    try {
      const outfitData = {
        name: suggestion.name,
        description: suggestion.reason,
        occasion: suggestion.occasion,
        season: suggestion.season,
        clothingIds: suggestion.items.map(item => item.id)
      }

      const response = await fetch('/api/outfits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outfitData)
      })

      if (!response.ok) {
        throw new Error('保存搭配失败')
      }

      // 显示成功消息
      alert('搭配方案已保存成功！')

      // 可以选择跳转到搭配列表页面
      // window.location.href = '/dashboard/outfits'
    } catch (error) {
      alert(error instanceof Error ? error.message : '保存搭配失败')
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">智能搭配推荐</h1>
          <p className="text-gray-600">
            基于您的衣物和喜好，为您推荐个性化的穿搭方案
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* 筛选条件 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">筛选条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                场合
              </label>
              <select
                value={filters.occasion}
                onChange={(e) => handleFilterChange('occasion', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">不限场合</option>
                <option value="casual">休闲</option>
                <option value="formal">正式</option>
                <option value="business">商务</option>
                <option value="sport">运动</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                季节
              </label>
              <select
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">不限季节</option>
                <option value="SPRING">春季</option>
                <option value="SUMMER">夏季</option>
                <option value="AUTUMN">秋季</option>
                <option value="WINTER">冬季</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色偏好
              </label>
              <input
                type="text"
                value={filters.colorPreference}
                onChange={(e) => handleFilterChange('colorPreference', e.target.value)}
                placeholder="例如：蓝色、白色"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={generateSuggestions}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? '生成中...' : '生成搭配建议'}
              </Button>
            </div>
          </div>
        </div>

        {/* 搭配建议 */}
        {suggestions.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                为您推荐 {suggestions.length} 套搭配
              </h2>
              <p className="text-sm text-gray-600">
                基于您的 {totalClothings} 件衣物
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {suggestion.name}
                      </h3>
                      <div className="flex space-x-2">
                        {suggestion.occasion && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {suggestion.occasion === 'casual' ? '休闲' :
                             suggestion.occasion === 'formal' ? '正式' :
                             suggestion.occasion === 'business' ? '商务' : '运动'}
                          </span>
                        )}
                        {suggestion.season && suggestion.season !== 'ALL_SEASON' && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {seasonLabels[suggestion.season]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 搭配理由 */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">搭配理由：</span>
                        {suggestion.reason}
                      </p>
                    </div>

                    {/* 衣物展示 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                      {suggestion.items.map((item) => (
                        <div key={item.id} className="text-center">
                          <div className="aspect-square relative mb-2">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {categoryLabels[item.category]}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.color}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSaveOutfit(suggestion)}
                      >
                        保存搭配
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => generateSuggestions()}
                      >
                        重新生成
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && suggestions.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              点击"生成搭配建议"开始获取推荐
            </div>
            <p className="text-gray-400 mb-8">
              我们会根据您的衣物和喜好为您推荐合适的穿搭组合
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">智能配色</h3>
                <p className="text-sm text-gray-600">
                  基于色彩搭配原理，推荐和谐的颜色组合
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">场合适配</h3>
                <p className="text-sm text-gray-600">
                  根据不同场合推荐合适的着装风格
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">个性化推荐</h3>
                <p className="text-sm text-gray-600">
                  结合您的喜好和穿着习惯进行推荐
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}