import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  const users = currentUser.role === 'ADMIN'
    ? await prisma.$queryRaw<any[]>`
        SELECT id, name, username, email, role, created_at AS createdAt
        FROM users
        ORDER BY created_at DESC
      `
    : await prisma.$queryRaw<any[]>`
        SELECT id, name, username, email, role, created_at AS createdAt
        FROM users
        WHERE id = ${currentUser.userId}
      `

  return users.map(u => ({ ...u, id: Number(u.id) }))
})