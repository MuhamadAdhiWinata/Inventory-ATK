import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM units WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'Satuan tidak ditemukan' })
  }

  const adaBarang = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
    `SELECT COUNT(*) AS total FROM items WHERE unit_id = ?`, id
  )
  if (Number(adaBarang[0]?.total) > 0) {
    throw createError({ statusCode: 409, message: 'Satuan tidak dapat dihapus karena masih digunakan oleh barang' })
  }

  await prisma.$executeRawUnsafe(`DELETE FROM units WHERE id = ?`, id)

  return { success: true, message: 'Satuan berhasil dihapus' }
})