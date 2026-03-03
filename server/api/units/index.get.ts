import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const data = await prisma.$queryRaw<any[]>`
    SELECT
      u.id,
      u.name,
      u.created_at  AS createdAt,
      COUNT(i.id)   AS jumlahBarang
    FROM units u
    LEFT JOIN items i ON i.unit_id = u.id
    GROUP BY u.id, u.name, u.created_at
    ORDER BY u.name ASC
  `
  return data.map(s => ({ ...s, jumlahBarang: Number(s.jumlahBarang) }))
})