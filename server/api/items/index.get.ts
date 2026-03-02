import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const halaman = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const kategori = query.kategori as string | undefined
  const offset = (halaman - 1) * limit

  const kondisiKategori = kategori && kategori !== 'Semua' ? 'WHERE c.name = ?' : ''
  const paramKategori = kategori && kategori !== 'Semua' ? [kategori] : []

  const [daftarItem, hasilHitung] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(`
      SELECT
        i.id,
        i.code          AS kodeBarang,
        i.name          AS namaBarang,
        c.name          AS kategori,
        sc.name         AS subKategori,
        u.name          AS satuan,
        i.min_stock     AS stokMin,
        COALESCE(SUM(
          CASE
            WHEN t.type = 'IN'         THEN t.quantity
            WHEN t.type = 'OUT'        THEN -t.quantity
            WHEN t.type = 'ADJUSTMENT' THEN t.quantity
            ELSE 0
          END
        ), 0) AS totalStock
      FROM items i
      JOIN sub_categories sc ON i.sub_category_id = sc.id
      JOIN categories c      ON sc.category_id = c.id
      JOIN units u            ON i.unit_id = u.id
      LEFT JOIN inventory_transactions t ON t.item_id = i.id
      ${kondisiKategori}
      GROUP BY i.id, i.code, i.name, c.name, sc.name, u.name, i.min_stock
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `, ...paramKategori, limit, offset),

    prisma.$queryRawUnsafe<[{ total: bigint }]>(`
      SELECT COUNT(DISTINCT i.id) AS total
      FROM items i
      JOIN sub_categories sc ON i.sub_category_id = sc.id
      JOIN categories c      ON sc.category_id = c.id
      ${kondisiKategori}
    `, ...paramKategori)
  ])

  return {
    data: daftarItem.map(item => ({
      ...item,
      totalStock: Number(item.totalStock),
      stokMin: Number(item.stokMin),
      status: Number(item.totalStock) > Number(item.stokMin) ? 'Aman' : 'Perlu Restock'
    })),
    success: true,
    message: 'Data berhasil diambil',
    total: Number(hasilHitung[0].total),
    page: halaman,
    limit
  }
})