import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.$queryRaw<{ id: number; name: string }[]>`
    SELECT id, name FROM units ORDER BY name ASC
  `
})