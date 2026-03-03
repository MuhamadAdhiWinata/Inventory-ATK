import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const data = await prisma.$queryRaw<any[]>`
    SELECT
      sc.id,
      sc.name,
      sc.category_id    AS kategoriId,
      c.name            AS kategoriNama,
      sc.created_at     AS createdAt,
      COUNT(i.id)       AS jumlahBarang
    FROM sub_categories sc
    JOIN categories c ON sc.category_id = c.id
    LEFT JOIN items i ON i.sub_category_id = sc.id
    GROUP BY sc.id, sc.name, sc.category_id, c.name, sc.created_at
    ORDER BY c.name ASC, sc.name ASC
  `

  return data.map(s => ({ ...s, jumlahBarang: Number(s.jumlahBarang) }))
})