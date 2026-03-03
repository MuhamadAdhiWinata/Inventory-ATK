import { useAuthStore } from '@/stores/auth'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  // Cek sesi saat app pertama kali load
  await authStore.inisialisasi()
})