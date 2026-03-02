import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { nama } = body

  if (!nama?.trim()) {
    throw createError({ statusCode: 400, message: 'Nama kategori wajib diisi' })
  }

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM categories WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'Kategori tidak ditemukan' })
  }

  const duplikat = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM categories WHERE name = ? AND id != ?`, nama.trim(), id
  )
  if (duplikat.length) {
    throw createError({ statusCode: 409, message: 'Nama kategori sudah digunakan' })
  }

  await prisma.$executeRawUnsafe(
    `UPDATE categories SET name = ?, updated_at = NOW() WHERE id = ?`,
    nama.trim(), id
  )

  return { success: true, message: 'Kategori berhasil diperbarui' }
})