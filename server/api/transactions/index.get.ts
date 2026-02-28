import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const type = query.type as string
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const search = query.search as string | undefined
  const offset = (page - 1) * limit

  const searchClause = search
    ? `AND (i.name LIKE ? OR t.transaction_code LIKE ?)`
    : ''

  const searchParams = search ? [`%${search}%`, `%${search}%`] : []

  const [transactions, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(`
      SELECT
        t.id,
        t.transaction_code AS transactionCode,
        t.type,
        t.date,
        t.quantity,
        t.note,
        t.description,
        t.item_id AS itemId,
        i.name AS itemName,
        u.name AS unit,
        t.gudang_id AS gudangId,
        g.name AS gudangName,
        t.user_id AS userId,
        us.name AS userName
      FROM inventory_transactions t
      JOIN items i ON t.item_id = i.id
      JOIN units u ON i.unit_id = u.id
      LEFT JOIN gudang g ON t.gudang_id = g.id
      JOIN users us ON t.user_id = us.id
      WHERE t.type = ?
      ${searchClause}
      ORDER BY t.date DESC, t.id DESC
      LIMIT ? OFFSET ?
    `, type, ...searchParams, limit, offset),

    prisma.$queryRawUnsafe<[{ total: bigint }]>(`
      SELECT COUNT(*) as total
      FROM inventory_transactions t
      JOIN items i ON t.item_id = i.id
      WHERE t.type = ?
      ${searchClause}
    `, type, ...searchParams)
  ])

  return {
    data: transactions.map(t => ({
      ...t,
      date: t.date instanceof Date ? t.date.toISOString() : t.date
    })),
    success: true,
    message: 'Data berhasil diambil',
    total: Number(countResult[0].total),
    page,
    limit
  }
})