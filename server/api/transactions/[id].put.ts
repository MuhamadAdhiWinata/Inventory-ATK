import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { itemId, gudangId, quantity, note, description, date } = body

  if (!itemId || !quantity) {
    throw createError({ statusCode: 400, message: 'itemId dan quantity wajib diisi' })
  }

  // Cek transaksi ada
  const transaksiLama = await prisma.$queryRawUnsafe<{ item_id: number; quantity: number; type: string }[]>(`
    SELECT item_id, quantity, type FROM inventory_transactions WHERE id = ?
  `, id)

  if (!transaksiLama.length) {
    throw createError({ statusCode: 404, message: 'Transaksi tidak ditemukan' })
  }

  const dataLama = transaksiLama[0]!

  // Revert stok lama
  const revertStok = dataLama.type === 'IN' ? -dataLama.quantity : dataLama.quantity
  await prisma.$executeRawUnsafe(`
    UPDATE items SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?
  `, revertStok, dataLama.item_id)

  // Update transaksi
  await prisma.$executeRawUnsafe(`
    UPDATE inventory_transactions
    SET item_id = ?, gudang_id = ?, quantity = ?, note = ?, description = ?, date = ?, updated_at = NOW()
    WHERE id = ?
  `, itemId, gudangId ?? null, quantity, note ?? null, description ?? null,
    date ? new Date(date) : new Date(), id
  )

  // Apply stok baru
  const perubahanStok = dataLama.type === 'IN' ? quantity : -quantity
  await prisma.$executeRawUnsafe(`
    UPDATE items SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?
  `, perubahanStok, itemId)

  return { success: true, message: 'Transaksi berhasil diperbarui' }
})