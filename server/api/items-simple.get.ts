import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.$queryRaw<{ id: number; code: string; name: string; unit: string }[]>`
    SELECT i.id, i.code, i.name, u.name AS unit
    FROM items i
    JOIN units u ON i.unit_id = u.id
    ORDER BY i.name ASC
  `
})