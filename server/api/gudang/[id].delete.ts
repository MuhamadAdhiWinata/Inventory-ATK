import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  const gudangYangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM gudang WHERE id = ?`, id
  )
  if (!gudangYangAda.length) {
    throw createError({ statusCode: 404, message: 'Gudang tidak ditemukan' })
  }

  const adaTransaksi = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
    `SELECT COUNT(*) AS total FROM inventory_transactions
     WHERE gudang_id = ? OR gudang_tujuan_id = ?`, id, id
  )
  if (Number(adaTransaksi[0]?.total) > 0) {
    throw createError({ statusCode: 409, message: 'Gudang tidak dapat dihapus karena masih memiliki riwayat transaksi' })
  }

  await prisma.$executeRawUnsafe(`DELETE FROM gudang WHERE id = ?`, id)

  return { success: true, message: 'Gudang berhasil dihapus' }
})