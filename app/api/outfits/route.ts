import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const outfitSchema = z.object({
  name: z.string().min(1, '搭配名称不能为空'),
  description: z.string().optional(),
  occasion: z.string().optional(),
  season: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON']).optional(),
  clothingIds: z.array(z.string()).min(1, '至少选择一件衣物')
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [outfits, total] = await Promise.all([
      prisma.outfit.findMany({
        where: { userId: session.user.id },
        include: {
          items: {
            include: {
              clothing: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.outfit.count({
        where: { userId: session.user.id }
      })
    ])

    return NextResponse.json({
      outfits,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('获取搭配方案失败:', error)
    return NextResponse.json(
      { error: '获取搭配方案失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, occasion, season, clothingIds } = outfitSchema.parse(body)

    // 验证衣物是否属于当前用户
    const clothings = await prisma.clothing.findMany({
      where: {
        id: { in: clothingIds },
        userId: session.user.id
      }
    })

    if (clothings.length !== clothingIds.length) {
      return NextResponse.json({ error: '包含无效的衣物ID' }, { status: 400 })
    }

    // 创建搭配方案
    const outfit = await prisma.outfit.create({
      data: {
        userId: session.user.id,
        name,
        description,
        occasion,
        season
      }
    })

    // 创建搭配项目关联
    await prisma.outfitItem.createMany({
      data: clothingIds.map(clothingId => ({
        outfitId: outfit.id,
        clothingId
      }))
    })

    // 获取完整的搭配信息
    const createdOutfit = await prisma.outfit.findUnique({
      where: { id: outfit.id },
      include: {
        items: {
          include: {
            clothing: true
          }
        }
      }
    })

    return NextResponse.json(createdOutfit)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('创建搭配方案失败:', error)
    return NextResponse.json(
      { error: '创建搭配方案失败' },
      { status: 500 }
    )
  }
}