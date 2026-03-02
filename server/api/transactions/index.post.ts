import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { itemId, gudangId, gudangTujuanId, quantity, note, description, date, type } = body

  if (!itemId || !quantity || !type) {
    throw createError({ statusCode: 400, message: 'itemId, quantity, dan type wajib diisi' })
  }

  if (type === 'TRANSFER' && (!gudangId || !gudangTujuanId)) {
    throw createError({ statusCode: 400, message: 'Transfer membutuhkan gudang asal dan gudang tujuan' })
  }

  if (type === 'TRANSFER' && gudangId === gudangTujuanId) {
    throw createError({ statusCode: 400, message: 'Gudang asal dan tujuan tidak boleh sama' })
  }

  // Hardcode userId = 1 sampai auth diimplementasi
  const userId = 1

  // Generate kode transaksi
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

  // Cek stok cukup untuk OUT dan TRANSFER
  if (type === 'OUT' || type === 'TRANSFER') {
    const stokGudangAsal = await prisma.$queryRawUnsafe<[{ stok: number }]>(`
      SELECT COALESCE(SUM(
        CASE
          WHEN type = 'IN'         THEN quantity
          WHEN type = 'OUT'        THEN -quantity
          WHEN type = 'ADJUSTMENT' THEN quantity
          WHEN type = 'TRANSFER' AND gudang_id = ?    THEN -quantity
          WHEN type = 'TRANSFER' AND gudang_tujuan_id = ? THEN quantity
          ELSE 0
        END
      ), 0) AS stok
      FROM inventory_transactions
      WHERE item_id = ? AND (gudang_id = ? OR gudang_tujuan_id = ?)
    `, gudangId, gudangId, itemId, gudangId, gudangId)

    if (Number(stokGudangAsal[0]?.stok ?? 0) < quantity) {
      throw createError({ statusCode: 400, message: 'Stok di gudang asal tidak mencukupi' })
    }
  }

  await prisma.$executeRawUnsafe(`
    INSERT INTO inventory_transactions
      (transaction_code, type, item_id, user_id, gudang_id, gudang_tujuan_id, quantity, note, description, date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `,
    kodeTransaksiBaru,
    type,
    itemId,
    userId,
    gudangId ?? null,
    gudangTujuanId ?? null,
    quantity,
    note ?? null,
    description ?? null,
    date ? new Date(date) : new Date()
  )

  return {
    success: true,
    message: 'Transaksi berhasil ditambahkan',
    transactionCode: kodeTransaksiBaru
  }
})