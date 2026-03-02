import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { nama, kategoriId } = body

  if (!nama?.trim() || !kategoriId) {
    throw createError({ statusCode: 400, message: 'Nama dan kategori wajib diisi' })
  }

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM sub_categories WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'Sub kategori tidak ditemukan' })
  }

  const duplikat = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM sub_categories WHERE name = ? AND category_id = ? AND id != ?`,
    nama.trim(), kategoriId, id
  )
  if (duplikat.length) {
    throw createError({ statusCode: 409, message: 'Sub kategori sudah ada di kategori ini' })
  }

  await prisma.$executeRawUnsafe(
    `UPDATE sub_categories SET name = ?, category_id = ?, updated_at = NOW() WHERE id = ?`,
    nama.trim(), kategoriId, id
  )

  return { success: true, message: 'Sub kategori berhasil diperbarui' }
})