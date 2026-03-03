import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { signToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { identifier, password } = body

  if (!identifier || !password) {
    throw createError({ statusCode: 400, message: 'Username/email dan password wajib diisi' })
  }

  const input = identifier.trim().toLowerCase()

  // Cari berdasarkan email ATAU username
  const users = await prisma.$queryRawUnsafe<{
    id: number
    name: string
    username: string
    email: string
    password: string
    role: string
  }[]>(
    `SELECT id, name, username, email, password, role
     FROM users
     WHERE LOWER(email) = ? OR LOWER(username) = ?
     LIMIT 1`,
    input, input
  )

  if (!users.length) {
    throw createError({ statusCode: 401, message: 'Username/email atau password salah' })
  }

  const user = users[0]!

  const passwordValid = await bcrypt.compare(password, user.password)
  if (!passwordValid) {
    throw createError({ statusCode: 401, message: 'Username/email atau password salah' })
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8,
    path: '/'
  })

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    }
  }
})