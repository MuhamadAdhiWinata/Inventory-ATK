import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, kategoriId } = body

  if (!name?.trim() || !kategoriId) {
    throw createError({ statusCode: 400, message: 'Nama dan kategori wajib diisi' })
  }

  const duplikat = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM sub_categories WHERE name = ? AND category_id = ?`,
    name.trim(), kategoriId
  )
  if (duplikat.length) {
    throw createError({ statusCode: 409, message: 'Sub kategori sudah ada di kategori ini' })
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO sub_categories (name, category_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
    name.trim(), kategoriId
  )

  return { success: true, message: 'Sub kategori berhasil ditambahkan' }
})