import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  // Cek transaksi ada
  const transaksiYangAda = await prisma.$queryRawUnsafe<{ item_id: number; quantity: number; type: string }[]>(`
    SELECT item_id, quantity, type FROM inventory_transactions WHERE id = ?
  `, id)

  if (!transaksiYangAda.length) {
    throw createError({ statusCode: 404, message: 'Transaksi tidak ditemukan' })
  }

  const transaksi = transaksiYangAda[0]!

  // Revert stok
  const revertStok = transaksi.type === 'IN' ? -transaksi.quantity : transaksi.quantity
  await prisma.$executeRawUnsafe(`
    UPDATE items SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?
  `, revertStok, transaksi.item_id)

  await prisma.$executeRawUnsafe(`
    DELETE FROM inventory_transactions WHERE id = ?
  `, id)

  return { success: true, message: 'Transaksi berhasil dihapus' }
})