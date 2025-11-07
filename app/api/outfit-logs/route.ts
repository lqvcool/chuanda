import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    return NextResponse.json({
      message: '穿搭记录功能开发中',
      logs: []
    })
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

    return NextResponse.json({
      message: '创建穿搭记录功能开发中',
      data: body
    })
  } catch (error) {
    console.error('创建穿搭记录失败:', error)
    return NextResponse.json(
      { error: '创建穿搭记录失败' },
      { status: 500 }
    )
  }
}