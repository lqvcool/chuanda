import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getClothingsByUserId, createClothing } from '@/lib/db'
import { writeFile } from 'fs/promises'
import path from 'path'
import { z } from 'zod'

const clothingSchema = z.object({
  name: z.string().min(1, '衣物名称不能为空'),
  category: z.enum(['TOP', 'BOTTOM', 'DRESS', 'SHOES', 'HAT', 'ACCESSORY', 'OUTERWEAR', 'UNDERWEAR', 'SOCKS', 'BAG']),
  color: z.string().min(1, '颜色不能为空'),
  brand: z.string().optional(),
  size: z.string().optional(),
  season: z.enum(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON']).optional(),
  tags: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const season = searchParams.get('season')

    // 获取所有衣物，然后在内存中过滤（简化实现）
    const clothings = await getClothingsByUserId(session.user.id)

    let filteredClothings = clothings

    if (category) {
      filteredClothings = filteredClothings.filter(c => c.category === category)
    }

    if (season) {
      filteredClothings = filteredClothings.filter(c => c.season === season)
    }

    return NextResponse.json(filteredClothings)
  } catch (error) {
    console.error('获取衣物列表失败:', error)
    return NextResponse.json(
      { error: '获取衣物列表失败' },
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

    const formData = await request.formData()
    const image = formData.get('image') as File
    const data = JSON.parse(formData.get('data') as string)

    // 验证数据
    const validatedData = clothingSchema.parse(data)

    if (!image) {
      return NextResponse.json({ error: '请上传图片' }, { status: 400 })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ error: '只支持 JPEG、PNG、WebP 格式的图片' }, { status: 400 })
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (image.size > maxSize) {
      return NextResponse.json({ error: '图片大小不能超过 5MB' }, { status: 400 })
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2)
    const fileName = `${timestamp}_${random}_${image.name}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadDir, fileName)

    // 确保上传目录存在
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 保存文件
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 保存到数据库
    const clothing = await createClothing({
      userId: session.user.id,
      name: validatedData.name,
      category: validatedData.category,
      color: validatedData.color,
      brand: validatedData.brand,
      size: validatedData.size,
      season: validatedData.season,
      tags: validatedData.tags,
      imageUrl: `/uploads/${fileName}`
    })

    return NextResponse.json(clothing)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('上传衣物失败:', error)
    return NextResponse.json(
      { error: '上传失败，请稍后重试' },
      { status: 500 }
    )
  }
}