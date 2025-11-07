import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOutfitsByUserId, createOutfit } from '@/lib/db'
import { z } from 'zod'

const outfitSchema = z.object({
  name: z.string().min(1, '搭配名称不能为空'),
  description: z.string().optional(),
  occasion: z.string().optional(),
  season: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON']).optional(),
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

    const outfits = await getOutfitsByUserId(session.user.id)

    // 简单分页实现
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedOutfits = outfits.slice(startIndex, endIndex)

    return NextResponse.json({
      outfits: paginatedOutfits,
      total: outfits.length,
      page,
      totalPages: Math.ceil(outfits.length / limit)
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
    const { name, description, occasion, season } = outfitSchema.parse(body)

    // 创建搭配方案
    const outfit = await createOutfit({
      userId: session.user.id,
      name,
      description,
      occasion,
      season
    })

    return NextResponse.json(outfit)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
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