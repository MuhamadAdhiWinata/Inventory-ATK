import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.$queryRaw<{ id: number; name: string; categoryId: number }[]>`
    SELECT id, name, category_id AS categoryId
    FROM sub_categories
    ORDER BY name ASC
  `
})