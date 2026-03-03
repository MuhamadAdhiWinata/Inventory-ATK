import bcrypt from 'bcryptjs'
import { prisma } from '../../utils/prisma'
import { signToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email dan password wajib diisi' })
  }

  // Cari user
  const users = await prisma.$queryRawUnsafe<{
    id: number
    name: string
    email: string
    password: string
    role: string
  }[]>(
    `SELECT id, name, email, password, role FROM users WHERE email = ? LIMIT 1`,
    email.toLowerCase().trim()
  )

  if (!users.length) {
    throw createError({ statusCode: 401, message: 'Email atau password salah' })
  }

  const user = users[0]!

  // Verifikasi password
  const passwordValid = await bcrypt.compare(password, user.password)
  if (!passwordValid) {
    throw createError({ statusCode: 401, message: 'Email atau password salah' })
  }

  // Generate token
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })

  // Set httpOnly cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 jam
    path: '/'
  })

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }
})