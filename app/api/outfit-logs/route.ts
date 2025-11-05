import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const outfitLogSchema = z.object({
  outfitId: z.string().min(1, '搭配方案ID不能为空'),
  wornDate: z.string().min(1, '穿着日期不能为空'),
  occasion: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      userId: session.user.id
    }

    if (startDate && endDate) {
      where.wornDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const outfitLogs = await prisma.outfitLog.findMany({
      where,
      include: {
        outfit: {
          include: {
            items: {
              include: {
                clothing: true
              }
            }
          }
        }
      },
      orderBy: { wornDate: 'desc' }
    })

    return NextResponse.json(outfitLogs)
  } catch (error) {
    console.error('获取穿搭记录失败:', error)
    return NextResponse.json(
      { error: '获取穿搭记录失败' },
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
    const { outfitId, wornDate, occasion, notes } = outfitLogSchema.parse(body)

    // 验证搭配方案是否属于当前用户
    const outfit = await prisma.outfit.findFirst({
      where: {
        id: outfitId,
        userId: session.user.id
      }
    })

    if (!outfit) {
      return NextResponse.json({ error: '搭配方案不存在' }, { status: 404 })
    }

    // 创建穿搭记录
    const outfitLog = await prisma.outfitLog.create({
      data: {
        userId: session.user.id,
        outfitId,
        wornDate: new Date(wornDate),
        occasion,
        notes
      },
      include: {
        outfit: {
          include: {
            items: {
              include: {
                clothing: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(outfitLog)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('创建穿搭记录失败:', error)
    return NextResponse.json(
      { error: '创建穿搭记录失败' },
      { status: 500 }
    )
  }
}