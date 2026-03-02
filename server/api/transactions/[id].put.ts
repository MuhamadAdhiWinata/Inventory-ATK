import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { itemId, gudangId, gudangTujuanId, quantity, note, description, date } = body

  if (!itemId || !quantity) {
    throw createError({ statusCode: 400, message: 'itemId dan quantity wajib diisi' })
  }

  const transaksiYangAda = await prisma.$queryRawUnsafe<{ id: number; type: string }[]>(`
    SELECT id, type FROM inventory_transactions WHERE id = ?
  `, id)

  if (!transaksiYangAda.length) {
    throw createError({ statusCode: 404, message: 'Transaksi tidak ditemukan' })
  }

  const tipeTransaksi = transaksiYangAda[0]!.type

  if (tipeTransaksi === 'TRANSFER' && (!gudangId || !gudangTujuanId)) {
    throw createError({ statusCode: 400, message: 'Transfer membutuhkan gudang asal dan gudang tujuan' })
  }

  await prisma.$executeRawUnsafe(`
    UPDATE inventory_transactions
    SET item_id = ?, gudang_id = ?, gudang_tujuan_id = ?, quantity = ?, note = ?, description = ?, date = ?, updated_at = NOW()
    WHERE id = ?
  `,
    itemId,
    gudangId ?? null,
    gudangTujuanId ?? null,
    quantity,
    note ?? null,
    description ?? null,
    date ? new Date(date) : new Date(),
    id
  )

  return { success: true, message: 'Transaksi berhasil diperbarui' }
})