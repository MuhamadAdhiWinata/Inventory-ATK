import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM items WHERE id = ?`, id
  )

  if (!existing.length) {
    throw createError({ statusCode: 404, message: 'Barang tidak ditemukan' })
  }

  await prisma.$executeRawUnsafe(`DELETE FROM items WHERE id = ?`, id)

  return { success: true, message: 'Barang berhasil dihapus' }
})