import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { name, username, email } = body

  if (!name?.trim() || !username?.trim() || !email?.trim()) {
    throw createError({ statusCode: 400, message: 'Nama, username, dan email wajib diisi' })
  }

  const yangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE id = ?`, id
  )
  if (!yangAda.length) {
    throw createError({ statusCode: 404, message: 'User tidak ditemukan' })
  }

  const dupUsername = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE LOWER(username) = ? AND id != ?`,
    username.trim().toLowerCase(), id
  )
  if (dupUsername.length) {
    throw createError({ statusCode: 409, message: 'Username sudah digunakan' })
  }

  const dupEmail = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE LOWER(email) = ? AND id != ?`,
    email.trim().toLowerCase(), id
  )
  if (dupEmail.length) {
    throw createError({ statusCode: 409, message: 'Email sudah digunakan' })
  }

  await prisma.$executeRawUnsafe(
    `UPDATE users SET name = ?, username = ?, email = ?, updated_at = NOW() WHERE id = ?`,
    name.trim(), username.trim().toLowerCase(), email.trim().toLowerCase(), id
  )

  return { success: true, message: 'User berhasil diperbarui' }
})