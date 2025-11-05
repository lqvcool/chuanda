import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 从 Prisma 查询推断类型，避免直接导入 Prisma 类型
type ClothingFromPrisma = Awaited<ReturnType<typeof prisma.clothing.findFirst>>
type Clothing = NonNullable<ClothingFromPrisma>
type ClothingCategory = 'TOP' | 'BOTTOM' | 'DRESS' | 'SHOES' | 'HAT' | 'ACCESSORY' | 'OUTERWEAR' | 'UNDERWEAR' | 'SOCKS' | 'BAG'
type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | 'ALL_SEASON'

// 颜色搭配规则
const colorCombinations = {
  '白色': ['黑色', '灰色', '蓝色', '红色', '绿色', '所有颜色'],
  '黑色': ['白色', '灰色', '蓝色', '红色', '黄色', '所有颜色'],
  '灰色': ['白色', '黑色', '蓝色', '红色', '绿色', '所有颜色'],
  '蓝色': ['白色', '黑色', '灰色', '黄色', '红色'],
  '红色': ['白色', '黑色', '灰色', '蓝色'],
  '绿色': ['白色', '黑色', '灰色', '蓝色'],
  '黄色': ['白色', '黑色', '灰色', '蓝色'],
  '粉色': ['白色', '黑色', '灰色', '蓝色'],
  '紫色': ['白色', '黑色', '灰色'],
  '棕色': ['白色', '黑色', '灰色', '蓝色'],
}

// 场合搭配规则
const occasionRules = {
  casual: {
    TOP: ['T恤', '衬衫', '卫衣', '毛衣'],
    BOTTOM: ['牛仔裤', '休闲裤', '短裤'],
    SHOES: ['运动鞋', '休闲鞋', '帆布鞋']
  },
  formal: {
    TOP: ['衬衫', '西装', '正装'],
    BOTTOM: ['西裤', '正装裤'],
    SHOES: ['皮鞋', '正装鞋']
  },
  business: {
    TOP: ['衬衫', '西装', '商务休闲'],
    BOTTOM: ['西裤', '休闲裤'],
    SHOES: ['皮鞋', '商务休闲鞋']
  },
  sport: {
    TOP: ['运动T恤', '运动衫'],
    BOTTOM: ['运动裤', '短裤'],
    SHOES: ['运动鞋']
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { occasion, season, colorPreference } = body

    // 获取用户所有衣物
    const allClothings = await prisma.clothing.findMany({
      where: { userId: session.user.id }
    })

    if (allClothings.length === 0) {
      return NextResponse.json({ error: '请先添加一些衣物' }, { status: 400 })
    }

    // 根据季节筛选
    let seasonalClothings = allClothings
    if (season && season !== 'ALL_SEASON') {
      seasonalClothings = allClothings.filter((item: Clothing | null): item is Clothing =>
        item !== null && (!item.season || item.season === season || item.season === 'ALL_SEASON')
      )
    }

    // 按分类分组
    const categorizedClothings = {
      TOP: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'TOP'),
      BOTTOM: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'BOTTOM'),
      DRESS: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'DRESS'),
      SHOES: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'SHOES'),
      HAT: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'HAT'),
      ACCESSORY: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'ACCESSORY'),
      OUTERWEAR: seasonalClothings.filter((item: Clothing | null): item is Clothing => item !== null && item.category === 'OUTERWEAR'),
    }

    // 生成搭配建议
    const suggestions = []

    // 方案1：上衣 + 裤子 + 鞋子
    if (categorizedClothings.TOP.length > 0 && categorizedClothings.BOTTOM.length > 0) {
      for (let i = 0; i < Math.min(3, categorizedClothings.TOP.length); i++) {
        const top = categorizedClothings.TOP[i]
        const suitableBottoms = findMatchingItems(top, categorizedClothings.BOTTOM, colorPreference)

        for (let j = 0; j < Math.min(2, suitableBottoms.length); j++) {
          const bottom = suitableBottoms[j]
          const suitableShoes = findMatchingItems(top, categorizedClothings.SHOES, colorPreference)

          if (suitableShoes.length > 0) {
            suggestions.push({
              id: `suggestion_${suggestions.length + 1}`,
              name: `休闲搭配 ${suggestions.length + 1}`,
              items: [top, bottom, suitableShoes[0]],
              occasion: occasion || 'casual',
              season: season || 'ALL_SEASON',
              reason: generateReason(top, bottom, occasion)
            })
          }
        }
      }
    }

    // 方案2：连衣裙 + 鞋子
    if (categorizedClothings.DRESS.length > 0) {
      for (let i = 0; i < Math.min(2, categorizedClothings.DRESS.length); i++) {
        const dress = categorizedClothings.DRESS[i]
        const suitableShoes = findMatchingItems(dress, categorizedClothings.SHOES, colorPreference)

        if (suitableShoes.length > 0) {
          suggestions.push({
            id: `suggestion_${suggestions.length + 1}`,
            name: `连衣裙搭配 ${suggestions.length + 1}`,
            items: [dress, suitableShoes[0]],
            occasion: occasion || 'casual',
            season: season || 'ALL_SEASON',
            reason: generateReason(dress, null, occasion)
          })
        }
      }
    }

    // 方案3：添加外套和配饰的完整搭配
    if (suggestions.length > 0 && categorizedClothings.OUTERWEAR.length > 0) {
      const enhancedSuggestions = suggestions.slice(0, 2).map(suggestion => {
        const outerwear = categorizedClothings.OUTERWEAR[Math.floor(Math.random() * categorizedClothings.OUTERWEAR.length)]
        return {
          ...suggestion,
          name: suggestion.name.replace('搭配', '完整搭配'),
          items: [...suggestion.items, outerwear],
          reason: `${suggestion.reason} 搭配${outerwear.name}，层次感更强。`
        }
      })
      suggestions.push(...enhancedSuggestions)
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 6), // 最多返回6个建议
      totalClothings: allClothings.length
    })

  } catch (error) {
    console.error('生成搭配建议失败:', error)
    return NextResponse.json(
      { error: '生成搭配建议失败，请稍后重试' },
      { status: 500 }
    )
  }
}

function findMatchingItems(baseItem: Clothing, candidates: Clothing[], colorPreference?: string) {
  if (!candidates || candidates.length === 0) return []

  let scored = candidates.map(item => {
    let score = 0

    // 颜色搭配评分
    if (colorCombinations[baseItem.color as keyof typeof colorCombinations]?.includes(item.color)) {
      score += 3
    } else if (baseItem.color === item.color) {
      score += 1 // 同色系搭配
    }

    // 颜色偏好评分
    if (colorPreference && item.color.includes(colorPreference)) {
      score += 2
    }

    // 标签匹配评分
    if (baseItem.tags && item.tags) {
      const baseTags = baseItem.tags.split(',').map((tag: string) => tag.trim().toLowerCase())
      const itemTags = item.tags.split(',').map((tag: string) => tag.trim().toLowerCase())
      const commonTags = baseTags.filter((tag: string) => itemTags.includes(tag))
      score += commonTags.length
    }

    return { item, score }
  })

  // 按评分排序并返回最佳匹配
  scored.sort((a, b) => b.score - a.score)
  return scored.map(s => s.item)
}

function generateReason(item1: Clothing, item2: Clothing | null, occasion?: string) {
  const colorMatch = item2 ? colorCombinations[item1.color as keyof typeof colorCombinations]?.includes(item2.color) : false

  let reason = `${item1.name}`
  if (item2) {
    reason += ` 搭配 ${item2.name}`
    if (colorMatch) {
      reason += `，${item1.color}与${item2.color}是经典色彩组合`
    } else {
      reason += `，${item1.color}配${item2.color}，简洁大方`
    }
  }

  if (occasion) {
    const occasionText = {
      casual: '休闲',
      formal: '正式',
      business: '商务',
      sport: '运动'
    }[occasion] || occasion
    reason += `，适合${occasionText}场合`
  }

  return reason + '。'
}