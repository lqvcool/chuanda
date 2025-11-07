// Vercel Postgres 数据访问层 - 替代 Prisma
import { sql } from '@vercel/postgres';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Clothing {
  id: string;
  userId: string;
  name: string;
  category: string;
  color: string;
  brand?: string;
  size?: string;
  season?: string;
  tags?: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  occasion?: string;
  season?: string;
  generatedImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户操作
export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await sql`
    INSERT INTO users (email, password, name)
    VALUES (${user.email}, ${user.password}, ${user.name})
    RETURNING *;
  `;
  return result.rows[0] as User;
}

export async function getUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  return result.rows[0] as User | undefined;
}

export async function getUserById(id: string) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result.rows[0] as User | undefined;
}

// 衣物操作
export async function createClothing(clothing: Omit<Clothing, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await sql`
    INSERT INTO clothings (user_id, name, category, color, brand, size, season, tags, image_url)
    VALUES (${clothing.userId}, ${clothing.name}, ${clothing.category}, ${clothing.color}, ${clothing.brand}, ${clothing.size}, ${clothing.season}, ${clothing.tags}, ${clothing.imageUrl})
    RETURNING *;
  `;
  return result.rows[0] as Clothing;
}

export async function getClothingsByUserId(userId: string) {
  const result = await sql`SELECT * FROM clothings WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return result.rows as Clothing[];
}

export async function updateClothing(id: string, updates: Partial<Clothing>) {
  const sets: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'id' && value !== undefined) {
      // 转换数据库字段名
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      sets.push(`${dbKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (sets.length === 0) return null;

  values.push(id); // 添加 id 作为最后一个参数

  const result = await sql`
    UPDATE clothings 
    SET ${sql.unsafe(sets.join(', '))}, updated_at = NOW()
    WHERE id = $${paramCount}
    RETURNING *;
  `;
  return result.rows[0] as Clothing;
}

export async function deleteClothing(id: string) {
  const result = await sql`DELETE FROM clothings WHERE id = ${id} RETURNING *`;
  return result.rows[0] as Clothing;
}

// 搭配操作
export async function createOutfit(outfit: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>) {
  const result = await sql`
    INSERT INTO outfits (user_id, name, description, occasion, season, generated_image_url)
    VALUES (${outfit.userId}, ${outfit.name}, ${outfit.description}, ${outfit.occasion}, ${outfit.season}, ${outfit.generatedImageUrl})
    RETURNING *;
  `;
  return result.rows[0] as Outfit;
}

export async function getOutfitsByUserId(userId: string) {
  const result = await sql`SELECT * FROM outfits WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return result.rows as Outfit[];
}

// 初始化数据库表
export async function initializeDatabase() {
  // 创建 enum 类型
  await sql`
    DO $$ BEGIN
      CREATE TYPE clothing_category AS ENUM (
        'TOP', 'BOTTOM', 'DRESS', 'SHOES', 'HAT', 
        'ACCESSORY', 'OUTERWEAR', 'UNDERWEAR', 'SOCKS', 'BAG'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE season_type AS ENUM (
        'SPRING', 'SUMMER', 'AUTUMN', 'WINTER', 'ALL_SEASON'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // 创建 users 表
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 创建 clothings 表
  await sql`
    CREATE TABLE IF NOT EXISTS clothings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      category clothing_category NOT NULL,
      color VARCHAR(50) NOT NULL,
      brand VARCHAR(100),
      size VARCHAR(50),
      season season_type,
      tags TEXT,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 创建 outfits 表
  await sql`
    CREATE TABLE IF NOT EXISTS outfits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      occasion VARCHAR(50),
      season season_type,
      generated_image_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  // 创建 outfit_items 表
  await sql`
    CREATE TABLE IF NOT EXISTS outfit_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
      clothing_id UUID NOT NULL REFERENCES clothings(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(outfit_id, clothing_id)
    );
  `;

  // 创建 outfit_logs 表
  await sql`
    CREATE TABLE IF NOT EXISTS outfit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
      worn_date TIMESTAMP WITH TIME ZONE NOT NULL,
      occasion VARCHAR(50),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}