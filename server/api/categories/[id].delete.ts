import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM categories WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'Kategori tidak ditemukan' })
  }

  const adaSubKategori = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
    `SELECT COUNT(*) AS total FROM sub_categories WHERE category_id = ?`, id
  )
  if (Number(adaSubKategori[0]?.total) > 0) {
    throw createError({ statusCode: 409, message: 'Kategori tidak dapat dihapus karena masih memiliki sub kategori' })
  }

  await prisma.$executeRawUnsafe(`DELETE FROM categories WHERE id = ?`, id)

  return { success: true, message: 'Kategori berhasil dihapus' }
})