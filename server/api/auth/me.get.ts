import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // requireAuth sudah dihandle oleh server middleware,
  // tapi kita panggil lagi untuk dapat data user
  const user = await requireAuth(event)

  return {
    id: user.userId,
    name: user.name,
    email: user.email,
    role: user.role
  }
})