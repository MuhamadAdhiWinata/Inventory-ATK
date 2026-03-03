import { getUserFromEvent } from '../utils/auth'

const PUBLIK_ROUTES = ['/api/auth/login']

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  if (!path.startsWith('/api/')) return

  if (PUBLIK_ROUTES.some(r => path.startsWith(r))) return

  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.'
    })
  }

  event.context.user = user
})
