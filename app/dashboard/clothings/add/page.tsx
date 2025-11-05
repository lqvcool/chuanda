'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ClothingFormData {
  name: string
  category: string
  color: string
  brand: string
  size: string
  season: string
  tags: string
}

const categories = [
  { value: 'TOP', label: '上衣' },
  { value: 'BOTTOM', label: '裤子' },
  { value: 'DRESS', label: '裙子' },
  { value: 'SHOES', label: '鞋子' },
  { value: 'HAT', label: '帽子' },
  { value: 'ACCESSORY', label: '配饰' },
  { value: 'OUTERWEAR', label: '外套' },
  { value: 'UNDERWEAR', label: '内衣' },
  { value: 'SOCKS', label: '袜子' },
  { value: 'BAG', label: '包包' }
]

const seasons = [
  { value: 'SPRING', label: '春季' },
  { value: 'SUMMER', label: '夏季' },
  { value: 'AUTUMN', label: '秋季' },
  { value: 'WINTER', label: '冬季' },
  { value: 'ALL_SEASON', label: '四季' }
]

export default function AddClothing() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<ClothingFormData>({
    name: '',
    category: 'TOP',
    color: '',
    brand: '',
    size: '',
    season: 'ALL_SEASON',
    tags: ''
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('只支持 JPEG、PNG、WebP 格式的图片')
        return
      }

      // 验证文件大小 (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError('图片大小不能超过 5MB')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleInputChange = (field: keyof ClothingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('请选择要上传的图片')
      return
    }

    if (!formData.name.trim()) {
      setError('请输入衣物名称')
      return
    }

    if (!formData.color.trim()) {
      setError('请选择颜色')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('image', selectedFile)
      formDataToSubmit.append('data', JSON.stringify(formData))

      const response = await fetch('/api/clothings', {
        method: 'POST',
        body: formDataToSubmit
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      router.push('/dashboard/clothings')
    } catch (error) {
      setError(error instanceof Error ? error.message : '上传失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">添加新衣物</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                衣物图片 *
              </label>
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  {preview ? (
                    <img
                      src={preview}
                      alt="预览"
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">暂无图片</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    选择图片
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    支持 JPEG、PNG、WebP 格式，最大 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  衣物名称 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="例如：白色T恤"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  颜色 *
                </label>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="例如：白色"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品牌
                </label>
                <Input
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="例如：UNIQLO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  尺寸
                </label>
                <Input
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="例如：L、170/92A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  季节
                </label>
                <select
                  value={formData.season}
                  onChange={(e) => handleInputChange('season', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {seasons.map(season => (
                    <option key={season.value} value={season.value}>
                      {season.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标签
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="用逗号分隔，例如：休闲,日常,舒适"
              />
              <p className="mt-1 text-sm text-gray-500">
                添加标签有助于后续的智能搭配推荐
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/clothings')}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}