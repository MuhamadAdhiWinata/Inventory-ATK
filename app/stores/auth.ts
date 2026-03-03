import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const sudahDiinisialisasi = ref(false)

  const isLoggedIn = computed(() => !!user.value)

  async function inisialisasi() {
    if (sudahDiinisialisasi.value) return
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    } finally {
      sudahDiinisialisasi.value = true
    }
  }

    async function login(identifier: string, password: string) {
    const data = await $fetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: { identifier, password }  // ← ganti dari { email, password }
    })
    user.value = data.user
    sudahDiinisialisasi.value = true
    return data.user
    }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    sudahDiinisialisasi.value = false
    await navigateTo('/login')
  }

  return { user, isLoggedIn, sudahDiinisialisasi, inisialisasi, login, logout }
})