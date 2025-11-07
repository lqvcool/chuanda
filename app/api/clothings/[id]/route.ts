import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateClothing, deleteClothing, getClothingsByUserId } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()

    // 简化的更新逻辑
    const updatedClothing = await updateClothing(id, {
      ...body,
      userId: session.user.id
    })

    if (!updatedClothing) {
      return NextResponse.json({ error: '衣物不存在' }, { status: 404 })
    }

    return NextResponse.json(updatedClothing)
  } catch (error) {
    console.error('更新衣物失败:', error)
    return NextResponse.json(
      { error: '更新衣物失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const id = params.id

    // 简化的删除逻辑
    const deletedClothing = await deleteClothing(id)

    if (!deletedClothing) {
      return NextResponse.json({ error: '衣物不存在' }, { status: 404 })
    }

    return NextResponse.json({ message: '删除成功' })
  } catch (error) {
    console.error('删除衣物失败:', error)
    return NextResponse.json(
      { error: '删除衣物失败' },
      { status: 500 }
    )
  }
}