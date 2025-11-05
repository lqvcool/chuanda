'use client'

import { useState, useEffect } from 'react'
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

interface OutfitLog {
  id: string
  wornDate: string
  occasion?: string
  notes?: string
  createdAt: string
  outfit: Outfit
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

const occasionLabels: { [key: string]: string } = {
  casual: '休闲',
  formal: '正式',
  business: '商务',
  sport: '运动'
}

export default function CalendarPage() {
  const [outfitLogs, setOutfitLogs] = useState<OutfitLog[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState('')
  const [occasion, setOccasion] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchOutfitLogs()
    fetchOutfits()
  }, [])

  const fetchOutfitLogs = async () => {
    try {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const response = await fetch(`/api/outfit-logs?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`)
      if (!response.ok) {
        throw new Error('获取穿搭记录失败')
      }
      const data = await response.json()
      setOutfitLogs(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '获取穿搭记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOutfits = async () => {
    try {
      const response = await fetch('/api/outfits?limit=100')
      if (!response.ok) {
        throw new Error('获取搭配方案失败')
      }
      const data = await response.json()
      setOutfits(data.outfits)
    } catch (error) {
      console.error('获取搭配方案失败:', error)
    }
  }

  const handleAddOutfitLog = async () => {
    if (!selectedOutfit) {
      alert('请选择搭配方案')
      return
    }

    try {
      const outfitLogData = {
        outfitId: selectedOutfit,
        wornDate: selectedDate.toISOString(),
        occasion,
        notes
      }

      const response = await fetch('/api/outfit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outfitLogData)
      })

      if (!response.ok) {
        throw new Error('添加穿搭记录失败')
      }

      setShowAddModal(false)
      setSelectedOutfit('')
      setOccasion('')
      setNotes('')
      fetchOutfitLogs()
      alert('穿搭记录添加成功！')
    } catch (error) {
      alert(error instanceof Error ? error.message : '添加穿搭记录失败')
    }
  }

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // 添加空白格子
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // 添加日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getOutfitLogForDate = (date: Date | null) => {
    if (!date) return null
    const dateStr = date.toDateString()
    return outfitLogs.find(log => new Date(log.wornDate).toDateString() === dateStr)
  }

  const formatMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    return `${year}年${month + 1}月`
  }

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setSelectedDate(newDate)
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
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">穿搭日历</h1>
            <p className="text-gray-600 mt-2">
              记录和查看您的每日穿搭
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            添加穿搭记录
          </Button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* 日历导航 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => changeMonth(-1)}
            >
              上个月
            </Button>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatMonth()}
            </h2>
            <Button
              variant="outline"
              onClick={() => changeMonth(1)}
            >
              下个月
            </Button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center font-medium text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日历格子 */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((date, index) => {
              const outfitLog = getOutfitLogForDate(date)
              const isToday = date && date.toDateString() === new Date().toDateString()

              return (
                <div
                  key={index}
                  className={`
                    border rounded-lg p-2 min-h-24
                    ${date ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => {
                    if (date) {
                      setSelectedDate(date)
                      setShowAddModal(true)
                    }
                  }}
                >
                  {date && (
                    <>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </span>
                        {outfitLog && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      {outfitLog && (
                        <div className="text-xs text-gray-600">
                          <div className="font-medium truncate">
                            {outfitLog.outfit.name}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {outfitLog.occasion && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">
                                {occasionLabels[outfitLog.occasion as keyof typeof occasionLabels] || outfitLog.occasion}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 穿搭统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">本月穿搭</h3>
            <p className="text-3xl font-bold text-blue-600">{outfitLogs.length}</p>
            <p className="text-sm text-gray-600 mt-1">次记录</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">搭配方案</h3>
            <p className="text-3xl font-bold text-green-600">{outfits.length}</p>
            <p className="text-sm text-gray-600 mt-1">个可选</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">今日穿搭</h3>
            <p className="text-3xl font-bold text-purple-600">
              {getOutfitLogForDate(new Date()) ? '已记录' : '待记录'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {getOutfitLogForDate(new Date()) ? '点击查看详情' : '点击添加记录'}
            </p>
          </div>
        </div>
      </div>

      {/* 添加穿搭记录弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              添加穿搭记录
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDate.toLocaleDateString()}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择搭配方案
                </label>
                <select
                  value={selectedOutfit}
                  onChange={(e) => setSelectedOutfit(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">请选择搭配方案</option>
                  {outfits.map((outfit) => (
                    <option key={outfit.id} value={outfit.id}>
                      {outfit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  场合
                </label>
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="例如：工作、约会、运动"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录今天的穿搭心情或其他信息..."
                  className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  setSelectedOutfit('')
                  setOccasion('')
                  setNotes('')
                }}
              >
                取消
              </Button>
              <Button onClick={handleAddOutfitLog}>
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}