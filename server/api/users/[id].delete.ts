import { prisma } from '../../utils/prisma'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const currentUser = await requireAuth(event)

  if (currentUser.userId === id) {
    throw createError({ statusCode: 400, message: 'Tidak dapat menghapus akun sendiri' })
  }

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'User tidak ditemukan' })
  }

  await prisma.$executeRawUnsafe(`DELETE FROM users WHERE id = ?`, id)

  return { success: true, message: 'User berhasil dihapus' }
})