import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const daftarGudang = await prisma.$queryRaw<any[]>`
    SELECT
      g.id,
      g.name,
      g.location,
      g.created_at  AS createdAt,
      COUNT(DISTINCT CASE WHEN t.type IN ('IN','OUT','ADJUSTMENT') THEN t.item_id
                         WHEN t.type = 'TRANSFER' THEN t.item_id END) AS jumlahItem
    FROM gudang g
    LEFT JOIN inventory_transactions t ON t.gudang_id = g.id OR t.gudang_tujuan_id = g.id
    GROUP BY g.id, g.name, g.location, g.created_at
    ORDER BY g.name ASC
  `

  return daftarGudang.map(g => ({
    ...g,
    jumlahItem: Number(g.jumlahItem)
  }))
})