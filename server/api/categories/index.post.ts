import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nama } = body

  if (!nama?.trim()) {
    throw createError({ statusCode: 400, message: 'Nama kategori wajib diisi' })
  }

  const sudahAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM categories WHERE name = ?`, nama.trim()
  )
  if (sudahAda.length) {
    throw createError({ statusCode: 409, message: 'Nama kategori sudah digunakan' })
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO categories (name, created_at, updated_at) VALUES (?, NOW(), NOW())`,
    nama.trim()
  )

  return { success: true, message: 'Kategori berhasil ditambahkan' }
})