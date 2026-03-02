import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const type = query.type as string
  const halaman = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const pencarian = query.search as string | undefined
  const offset = (halaman - 1) * limit

  const kondisiPencarian = pencarian
    ? `AND (i.name LIKE ? OR t.transaction_code LIKE ?)`
    : ''
  const paramPencarian = pencarian ? [`%${pencarian}%`, `%${pencarian}%`] : []

  const kondisiType = type ? `WHERE t.type = ?` : ''
  const paramType = type ? [type] : []

  const [transaksi, hasilHitung] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(`
      SELECT
        t.id,
        t.transaction_code  AS transactionCode,
        t.type,
        t.date,
        t.quantity,
        t.note,
        t.description,
        t.item_id           AS itemId,
        i.name              AS itemName,
        u.name              AS unit,
        t.gudang_id         AS gudangId,
        g.name              AS gudangName,
        t.gudang_tujuan_id  AS gudangTujuanId,
        gt.name             AS gudangTujuanName,
        t.user_id           AS userId,
        us.name             AS userName
      FROM inventory_transactions t
      JOIN items i          ON t.item_id = i.id
      JOIN units u          ON i.unit_id = u.id
      LEFT JOIN gudang g    ON t.gudang_id = g.id
      LEFT JOIN gudang gt   ON t.gudang_tujuan_id = gt.id
      JOIN users us         ON t.user_id = us.id
      ${kondisiType}
      ${pencarian ? `AND (i.name LIKE ? OR t.transaction_code LIKE ?)` : ''}
      ORDER BY t.date DESC, t.id DESC
      LIMIT ? OFFSET ?
    `, ...paramType, ...paramPencarian, limit, offset),

    prisma.$queryRawUnsafe<[{ total: bigint }]>(`
      SELECT COUNT(*) AS total
      FROM inventory_transactions t
      JOIN items i ON t.item_id = i.id
      ${kondisiType}
      ${pencarian ? `AND (i.name LIKE ? OR t.transaction_code LIKE ?)` : ''}
    `, ...paramType, ...paramPencarian)
  ])

  return {
    data: transaksi.map(t => ({
      ...t,
      date: t.date instanceof Date ? t.date.toISOString() : t.date
    })),
    success: true,
    message: 'Data berhasil diambil',
    total: Number(hasilHitung[0].total),
    page: halaman,
    limit
  }
})