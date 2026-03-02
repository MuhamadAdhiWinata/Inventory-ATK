import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM sub_categories WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'Sub kategori tidak ditemukan' })
  }

  const adaBarang = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
    `SELECT COUNT(*) AS total FROM items WHERE sub_category_id = ?`, id
  )
  if (Number(adaBarang[0]?.total) > 0) {
    throw createError({ statusCode: 409, message: 'Sub kategori tidak dapat dihapus karena masih memiliki barang' })
  }

  await prisma.$executeRawUnsafe(`DELETE FROM sub_categories WHERE id = ?`, id)

  return { success: true, message: 'Sub kategori berhasil dihapus' }
})