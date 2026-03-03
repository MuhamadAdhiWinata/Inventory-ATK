import bcrypt from 'bcryptjs'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { newPassword } = body

  if (!newPassword || newPassword.length < 6) {
    throw createError({ statusCode: 400, message: 'Password baru minimal 6 karakter' })
  }

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'User tidak ditemukan' })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.$executeRawUnsafe(
    `UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?`,
    passwordHash, id
  )

  return { success: true, message: 'Password berhasil direset' }
})