import { verifyToken, type JwtPayload } from './jwt'
import type { H3Event } from 'h3'

export async function getUserFromEvent(event: H3Event): Promise<JwtPayload | null> {
  try {
    const token = getCookie(event, 'auth_token')
    if (!token) return null
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  const user = await getUserFromEvent(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }
  return user
}