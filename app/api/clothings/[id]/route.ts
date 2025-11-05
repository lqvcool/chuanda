import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateClothingSchema = z.object({
  name: z.string().min(1, '衣物名称不能为空').optional(),
  category: z.enum(['TOP', 'BOTTOM', 'DRESS', 'SHOES', 'HAT', 'ACCESSORY', 'OUTERWEAR', 'UNDERWEAR', 'SOCKS', 'BAG']).optional(),
  color: z.string().min(1, '颜色不能为空').optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  season: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON']).optional(),
  tags: z.string().optional(),
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

    const clothing = await prisma.clothing.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!clothing) {
      return NextResponse.json({ error: '衣物不存在' }, { status: 404 })
    }

    return NextResponse.json(clothing)
  } catch (error) {
    console.error('获取衣物失败:', error)
    return NextResponse.json(
      { error: '获取衣物失败' },
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
    const validatedData = updateClothingSchema.parse(body)

    // 检查衣物是否存在且属于当前用户
    const existingClothing = await prisma.clothing.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingClothing) {
      return NextResponse.json({ error: '衣物不存在' }, { status: 404 })
    }

    // 更新衣物
    const updatedClothing = await prisma.clothing.update({
      where: { id: id },
      data: validatedData
    })

    return NextResponse.json(updatedClothing)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('更新衣物失败:', error)
    return NextResponse.json(
      { error: '更新失败，请稍后重试' },
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

    // 检查衣物是否存在且属于当前用户
    const existingClothing = await prisma.clothing.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingClothing) {
      return NextResponse.json({ error: '衣物不存在' }, { status: 404 })
    }

    // 删除衣物记录
    await prisma.clothing.delete({
      where: { id: id }
    })

    // TODO: 删除对应的图片文件

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除衣物失败:', error)
    return NextResponse.json(
      { error: '删除失败，请稍后重试' },
      { status: 500 }
    )
  }
}