import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateOutfitSchema = z.object({
  name: z.string().min(1, '搭配名称不能为空').optional(),
  description: z.string().optional(),
  occasion: z.string().optional(),
  season: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON']).optional(),
  clothingIds: z.array(z.string()).min(1, '至少选择一件衣物').optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const outfit = await prisma.outfit.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        items: {
          include: {
            clothing: true
          }
        }
      }
    })

    if (!outfit) {
      return NextResponse.json({ error: '搭配方案不存在' }, { status: 404 })
    }

    return NextResponse.json(outfit)
  } catch (error) {
    console.error('获取搭配方案失败:', error)
    return NextResponse.json(
      { error: '获取搭配方案失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateOutfitSchema.parse(body)

    // 检查搭配方案是否存在且属于当前用户
    const existingOutfit = await prisma.outfit.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingOutfit) {
      return NextResponse.json({ error: '搭配方案不存在' }, { status: 404 })
    }

    // 如果更新衣物列表
    if (validatedData.clothingIds) {
      // 验证衣物是否属于当前用户
      const clothings = await prisma.clothing.findMany({
        where: {
          id: { in: validatedData.clothingIds },
          userId: session.user.id
        }
      })

      if (clothings.length !== validatedData.clothingIds.length) {
        return NextResponse.json({ error: '包含无效的衣物ID' }, { status: 400 })
      }

      // 删除原有的搭配项目
      await prisma.outfitItem.deleteMany({
        where: { outfitId: id }
      })

      // 创建新的搭配项目
      await prisma.outfitItem.createMany({
        data: validatedData.clothingIds.map(clothingId => ({
          outfitId: id,
          clothingId
        }))
      })
    }

    // 更新搭配方案信息
    const { clothingIds, ...updateData } = validatedData
    const updatedOutfit = await prisma.outfit.update({
      where: { id: id },
      data: updateData
    })

    // 获取完整的搭配信息
    const result = await prisma.outfit.findUnique({
      where: { id: id },
      include: {
        items: {
          include: {
            clothing: true
          }
        }
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('更新搭配方案失败:', error)
    return NextResponse.json(
      { error: '更新搭配方案失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 检查搭配方案是否存在且属于当前用户
    const existingOutfit = await prisma.outfit.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingOutfit) {
      return NextResponse.json({ error: '搭配方案不存在' }, { status: 404 })
    }

    // 删除搭配方案（会级联删除搭配项目）
    await prisma.outfit.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除搭配方案失败:', error)
    return NextResponse.json(
      { error: '删除搭配方案失败' },
      { status: 500 }
    )
  }
}