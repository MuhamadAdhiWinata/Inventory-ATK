import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, username, email, password, role } = body

  if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
    throw createError({ statusCode: 400, message: 'Semua field wajib diisi' })
  }

  const dupUsername = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE LOWER(username) = ?`, username.trim().toLowerCase()
  )
  if (dupUsername.length) {
    throw createError({ statusCode: 409, message: 'Username sudah digunakan' })
  }

  const dupEmail = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM users WHERE LOWER(email) = ?`, email.trim().toLowerCase()
  )
  if (dupEmail.length) {
    throw createError({ statusCode: 409, message: 'Email sudah digunakan' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$executeRawUnsafe(
    `INSERT INTO users (name, username, email, password, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    name.trim(),
    username.trim().toLowerCase(),
    email.trim().toLowerCase(),
    passwordHash,
    role ?? 'admin'
  )

  return { success: true, message: 'User berhasil ditambahkan' }
})