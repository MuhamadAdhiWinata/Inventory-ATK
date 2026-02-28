import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { itemId, gudangId, quantity, note, description, date, type } = body

  if (!itemId || !quantity || !type) {
    throw createError({ statusCode: 400, message: 'itemId, quantity, dan type wajib diisi' })
  }

  // Hardcode userId = 1 sampai auth diimplementasi
  const userId = 1

  // Generate transaction code
  const transaksiTerakhir = await prisma.$queryRawUnsafe<{ transaction_code: string }[]>(`
    SELECT transaction_code FROM inventory_transactions
    WHERE type = ?
    ORDER BY id DESC LIMIT 1
  `, type)

  let kodeTransaksiBaru = `${type}-001`
  if (transaksiTerakhir.length > 0 && transaksiTerakhir[0]) {
    const nomorTerakhir = parseInt(transaksiTerakhir[0].transaction_code.replace(`${type}-`, ''))
    kodeTransaksiBaru = `${type}-${String(nomorTerakhir + 1).padStart(3, '0')}`
  }

  await prisma.$executeRawUnsafe(`
    INSERT INTO inventory_transactions
      (transaction_code, type, item_id, user_id, gudang_id, quantity, note, description, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, kodeTransaksiBaru, type, itemId, userId, gudangId ?? null, quantity, note ?? null, description ?? null,
    date ? new Date(date) : new Date()
  )

  // Update current_stock
  const perubahanStok = type === 'IN' ? quantity : -quantity
  await prisma.$executeRawUnsafe(`
    UPDATE items SET current_stock = current_stock + ?, updated_at = NOW() WHERE id = ?
  `, perubahanStok, itemId)

  return {
    success: true,
    message: 'Transaksi berhasil ditambahkan',
    transactionCode: kodeTransaksiBaru
  }
})