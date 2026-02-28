import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.$queryRaw<{ id: number; name: string; location: string | null }[]>`
    SELECT id, name, location FROM gudang ORDER BY name ASC
  `
})