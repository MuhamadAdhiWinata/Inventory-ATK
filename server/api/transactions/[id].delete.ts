import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const transaksiYangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(`
    SELECT id FROM inventory_transactions WHERE id = ?
  `, id)

  if (!transaksiYangAda.length) {
    throw createError({ statusCode: 404, message: 'Transaksi tidak ditemukan' })
  }

  await prisma.$executeRawUnsafe(`
    DELETE FROM inventory_transactions WHERE id = ?
  `, id)

  return { success: true, message: 'Transaksi berhasil dihapus' }
})