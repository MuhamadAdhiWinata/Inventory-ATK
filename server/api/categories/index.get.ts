import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.$queryRaw<{ name: string }[]>`
    SELECT name
    FROM categories
    ORDER BY name ASC
  `

  return ['Semua', ...categories.map(c => c.name)]
})