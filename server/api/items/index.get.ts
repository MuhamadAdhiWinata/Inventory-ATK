import { prisma } from '../../utils/prisma'
import type { MasterItem, MasterDataResponse } from '#shared/types/IMasterData'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const kategori = query.kategori as string | undefined

  const offset = (page - 1) * limit

  // Build WHERE clause
  const whereClause = kategori && kategori !== 'Semua'
    ? `WHERE c.name = ${kategori}`
    : ''

  const [items, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<MasterItem[]>(`
      SELECT
        i.id,
        i.code AS kodeBarang,
        i.name AS namaBarang,
        c.name AS kategori,
        sc.name AS subKategori,
        u.name AS satuan,
        i.current_stock AS currentStock,
        i.min_stock AS stokMin,
        CASE WHEN i.current_stock > i.min_stock THEN 'Aman' ELSE 'Perlu Restock' END AS status
      FROM items i
      JOIN sub_categories sc ON i.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      JOIN units u ON i.unit_id = u.id
      ${kategori && kategori !== 'Semua' ? `WHERE c.name = ?` : ''}
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `, ...(kategori && kategori !== 'Semua' ? [kategori, limit, offset] : [limit, offset])),

    prisma.$queryRawUnsafe<[{ total: bigint }]>(`
      SELECT COUNT(*) as total
      FROM items i
      JOIN sub_categories sc ON i.sub_category_id = sc.id
      JOIN categories c ON sc.category_id = c.id
      ${kategori && kategori !== 'Semua' ? `WHERE c.name = ?` : ''}
    `, ...(kategori && kategori !== 'Semua' ? [kategori] : []))
  ])

  return {
    data: items,
    message: 'Data berhasil diambil',
    success: true,
    total: Number(countResult[0].total),
    page,
    limit
  } satisfies MasterDataResponse
})