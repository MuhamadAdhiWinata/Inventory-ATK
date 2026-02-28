import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.$queryRaw<{ id: number; code: string; name: string }[]>`
    SELECT id, code, name FROM items ORDER BY name ASC
  `
})