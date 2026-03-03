import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const daftarKategori = await prisma.$queryRaw<any[]>`
    SELECT
      c.id,
      c.name,
      c.created_at  AS createdAt,
      COUNT(sc.id)  AS jumlahSubKategori
    FROM categories c
    LEFT JOIN sub_categories sc ON sc.category_id = c.id
    GROUP BY c.id, c.name, c.created_at
    ORDER BY c.name ASC
  `

  return daftarKategori.map(k => ({
    ...k,
    jumlahSubKategori: Number(k.jumlahSubKategori)
  }))
})