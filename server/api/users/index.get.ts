import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  const users = await prisma.$queryRaw<any[]>`
    SELECT id, name, username, email, role, created_at AS createdAt
    FROM users
    ORDER BY created_at DESC
  `
  return users
})