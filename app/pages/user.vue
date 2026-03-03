<template>
  <main class="p-4 md:p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between border-b pb-4">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <UsersIcon class="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Manajemen User</h1>
          <p class="text-muted-foreground text-sm">Kelola akun pengguna sistem.</p>
        </div>
      </div>
      <button @click="bukaFormTambah"
        class="inline-flex items-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors">
        <PlusIcon class="h-4 w-4" /> Tambah User
      </button>
    </div>

    <!-- Loading -->
    <div v-if="sedangMemuat" class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error -->
    <div v-else-if="pesanError" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <p class="text-destructive font-semibold mb-1">Terjadi Kesalahan</p>
      <p class="text-sm text-muted-foreground mb-4">{{ pesanError }}</p>
      <button @click="ambilData" class="rounded-md text-sm bg-primary text-primary-foreground h-9 px-4">Coba Lagi</button>
    </div>

    <!-- Table -->
    <div v-else class="border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b bg-muted/50">
          <tr>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">User</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground hidden md:table-cell">Username</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground hidden lg:table-cell">Email</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Role</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in daftarUser" :key="user.id"
            class="border-b transition-colors hover:bg-muted/50"
            :class="{ 'bg-primary/5 dark:bg-primary/10': user.id === authStore.user?.id }">
            <td class="p-4">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="text-xs font-bold text-primary">{{ getInisial(user.name) }}</span>
                </div>
                <div>
                  <p class="font-medium leading-tight">{{ user.name }}</p>
                  <p class="text-xs text-muted-foreground md:hidden">@{{ user.username }}</p>
                  <span v-if="user.id === authStore.user?.id"
                    class="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">
                    Akun Anda
                  </span>
                </div>
              </div>
            </td>
            <td class="p-4 hidden md:table-cell">
              <span class="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                @{{ user.username }}
              </span>
            </td>
            <td class="p-4 hidden lg:table-cell text-muted-foreground text-sm">{{ user.email }}</td>
            <td class="p-4">
              <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {{ user.role }}
              </span>
            </td>
            <td class="p-4">
              <div class="flex items-center gap-1.5">
                <button @click="bukaFormEdit(user)" title="Edit user"
                  class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors">
                  <PencilIcon class="h-3.5 w-3.5" />
                </button>
                <button @click="bukaFormReset(user)" title="Reset password"
                  class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition-colors">
                  <KeyRoundIcon class="h-3.5 w-3.5" />
                </button>
                <button @click="bukaDialogHapus(user)" title="Hapus user"
                  :disabled="user.id === authStore.user?.id"
                  class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  <Trash2Icon class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="daftarUser.length === 0" class="text-center py-16 text-sm text-muted-foreground">
        Belum ada user.
      </div>
    </div>

    <!-- ===== MODAL TAMBAH / EDIT ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formTerbuka" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="tutupForm" />
          <div class="relative z-10 w-full max-w-md bg-card rounded-xl shadow-xl border">
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 class="text-base font-semibold">{{ isEditMode ? 'Edit User' : 'Tambah User Baru' }}</h2>
                <p class="text-xs text-muted-foreground mt-0.5">{{ isEditMode ? 'Ubah informasi akun' : 'Buat akun pengguna baru' }}</p>
              </div>
              <button @click="tutupForm" class="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
                <XIcon class="h-4 w-4" />
              </button>
            </div>
            <form @submit.prevent="handleSubmitUser" class="px-6 py-5 space-y-4">
              <!-- Nama -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Nama Lengkap <span class="text-destructive">*</span></label>
                <input v-model="formUser.name" type="text" placeholder="Contoh: Budi Santoso"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                  :class="{ 'border-destructive': errorsUser.name }" />
                <p v-if="errorsUser.name" class="text-xs text-destructive">{{ errorsUser.name }}</p>
              </div>
              <!-- Username -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Username <span class="text-destructive">*</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                  <input v-model="formUser.username" type="text" placeholder="budisantoso"
                    class="w-full h-9 rounded-md border border-input bg-background pl-7 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                    :class="{ 'border-destructive': errorsUser.username }" />
                </div>
                <p v-if="errorsUser.username" class="text-xs text-destructive">{{ errorsUser.username }}</p>
              </div>
              <!-- Email -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Email <span class="text-destructive">*</span></label>
                <input v-model="formUser.email" type="email" placeholder="budi@sekolah.com"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                  :class="{ 'border-destructive': errorsUser.email }" />
                <p v-if="errorsUser.email" class="text-xs text-destructive">{{ errorsUser.email }}</p>
              </div>
              <!-- Password (hanya tambah) -->
              <div v-if="!isEditMode" class="space-y-1.5">
                <label class="text-sm font-medium">Password <span class="text-destructive">*</span></label>
                <div class="relative">
                  <input v-model="formUser.password" :type="tampilPassword ? 'text' : 'password'"
                    placeholder="Minimal 6 karakter"
                    class="w-full h-9 rounded-md border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                    :class="{ 'border-destructive': errorsUser.password }" />
                  <button type="button" @click="tampilPassword = !tampilPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <EyeIcon v-if="!tampilPassword" class="h-4 w-4" />
                    <EyeOffIcon v-else class="h-4 w-4" />
                  </button>
                </div>
                <p v-if="errorsUser.password" class="text-xs text-destructive">{{ errorsUser.password }}</p>
              </div>
              <!-- Footer -->
              <div class="flex justify-end gap-2 pt-2 border-t">
                <button type="button" @click="tutupForm"
                  class="rounded-md text-sm border border-input bg-background hover:bg-accent h-9 px-4 transition-colors">
                  Batal
                </button>
                <button type="submit" :disabled="sedangMenyimpan"
                  class="rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                  <span v-if="sedangMenyimpan" class="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {{ sedangMenyimpan ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== MODAL RESET PASSWORD ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formResetTerbuka" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="formResetTerbuka = false" />
          <div class="relative z-10 w-full max-w-sm bg-card rounded-xl shadow-xl border">
            <div class="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 class="text-base font-semibold">Reset Password</h2>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Untuk akun <span class="font-medium text-foreground">{{ userDipilih?.name }}</span>
                </p>
              </div>
              <button @click="formResetTerbuka = false" class="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
                <XIcon class="h-4 w-4" />
              </button>
            </div>
            <form @submit.prevent="handleResetPassword" class="px-6 py-5 space-y-4">
              <div class="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
                <ShieldAlertIcon class="h-4 w-4 shrink-0 mt-0.5" />
                <span>Pastikan password baru sudah dikomunikasikan kepada pengguna yang bersangkutan.</span>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Password Baru <span class="text-destructive">*</span></label>
                <div class="relative">
                  <input v-model="formReset.newPassword" :type="tampilPasswordBaru ? 'text' : 'password'"
                    placeholder="Minimal 6 karakter"
                    class="w-full h-9 rounded-md border border-input bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    :class="{ 'border-destructive': errorsReset.newPassword }" />
                  <button type="button" @click="tampilPasswordBaru = !tampilPasswordBaru"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <EyeIcon v-if="!tampilPasswordBaru" class="h-4 w-4" />
                    <EyeOffIcon v-else class="h-4 w-4" />
                  </button>
                </div>
                <p v-if="errorsReset.newPassword" class="text-xs text-destructive">{{ errorsReset.newPassword }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Konfirmasi Password <span class="text-destructive">*</span></label>
                <input v-model="formReset.confirmPassword" type="password" placeholder="Ulangi password baru"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errorsReset.confirmPassword }" />
                <p v-if="errorsReset.confirmPassword" class="text-xs text-destructive">{{ errorsReset.confirmPassword }}</p>
              </div>
              <div class="flex justify-end gap-2 pt-2 border-t">
                <button type="button" @click="formResetTerbuka = false"
                  class="rounded-md text-sm border border-input bg-background hover:bg-accent h-9 px-4 transition-colors">
                  Batal
                </button>
                <button type="submit" :disabled="sedangReset"
                  class="rounded-md text-sm bg-amber-500 text-white hover:bg-amber-600 h-9 px-4 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                  <span v-if="sedangReset" class="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {{ sedangReset ? 'Mereset...' : 'Reset Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Delete -->
    <ConfirmDialog
      :is-open="dialogHapusTerbuka"
      title="Hapus User"
      :description="`Hapus user '${userAkanDihapus?.name}' (@${userAkanDihapus?.username})? Tindakan ini tidak dapat dibatalkan.`"
      :loading="sedangMenghapus"
      @confirm="handleHapus"
      @cancel="dialogHapusTerbuka = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: ['auth'] })

import { UsersIcon, PlusIcon, PencilIcon, Trash2Icon, XIcon, KeyRoundIcon, EyeIcon, EyeOffIcon, ShieldAlertIcon } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()
const authStore = useAuthStore()

interface User { id: number; name: string; username: string; email: string; role: string; createdAt: string }

const daftarUser = ref<User[]>([])
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)

// Form user
const formTerbuka = ref(false)
const isEditMode = ref(false)
const sedangMenyimpan = ref(false)
const userDipilih = ref<User | null>(null)
const tampilPassword = ref(false)
const formUser = reactive({ name: '', username: '', email: '', password: '' })
const errorsUser = reactive<Record<string, string>>({})

// Reset password
const formResetTerbuka = ref(false)
const sedangReset = ref(false)
const tampilPasswordBaru = ref(false)
const formReset = reactive({ newPassword: '', confirmPassword: '' })
const errorsReset = reactive<Record<string, string>>({})

// Hapus
const dialogHapusTerbuka = ref(false)
const userAkanDihapus = ref<User | null>(null)
const sedangMenghapus = ref(false)

function getInisial(nama: string): string {
  const parts = nama.trim().split(' ')
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  return nama.slice(0, 2).toUpperCase()
}

async function ambilData() {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    daftarUser.value = await $fetch<User[]>('/api/users')
  } catch {
    pesanError.value = 'Gagal memuat data user.'
  } finally {
    sedangMemuat.value = false
  }
}

// FORM USER
function bukaFormTambah() {
  isEditMode.value = false
  userDipilih.value = null
  Object.assign(formUser, { name: '', username: '', email: '', password: '' })
  Object.keys(errorsUser).forEach(k => delete errorsUser[k])
  tampilPassword.value = false
  formTerbuka.value = true
}

function bukaFormEdit(user: User) {
  isEditMode.value = true
  userDipilih.value = user
  formUser.name = user.name
  formUser.username = user.username
  formUser.email = user.email
  formUser.password = ''
  Object.keys(errorsUser).forEach(k => delete errorsUser[k])
  formTerbuka.value = true
}

function tutupForm() {
  if (sedangMenyimpan.value) return
  formTerbuka.value = false
}

function validateUser(): boolean {
  Object.keys(errorsUser).forEach(k => delete errorsUser[k])
  if (!formUser.name.trim()) errorsUser.name = 'Nama wajib diisi'
  if (!formUser.username.trim()) errorsUser.username = 'Username wajib diisi'
  else if (!/^[a-z0-9_]+$/i.test(formUser.username)) errorsUser.username = 'Hanya huruf, angka, dan underscore'
  if (!formUser.email.trim()) errorsUser.email = 'Email wajib diisi'
  if (!isEditMode.value) {
    if (!formUser.password) errorsUser.password = 'Password wajib diisi'
    else if (formUser.password.length < 6) errorsUser.password = 'Password minimal 6 karakter'
  }
  return Object.keys(errorsUser).length === 0
}

async function handleSubmitUser() {
  if (!validateUser()) return
  sedangMenyimpan.value = true
  try {
    if (isEditMode.value && userDipilih.value) {
      await $fetch(`/api/users/${userDipilih.value.id}`, {
        method: 'PUT',
        body: { name: formUser.name, username: formUser.username, email: formUser.email }
      })
      toast({ title: 'Berhasil', description: 'User berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/users', { method: 'POST', body: formUser })
      toast({ title: 'Berhasil', description: 'User berhasil ditambahkan', variant: 'success' })
    }
    formTerbuka.value = false
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  } finally {
    sedangMenyimpan.value = false
  }
}

// RESET PASSWORD
function bukaFormReset(user: User) {
  userDipilih.value = user
  formReset.newPassword = ''
  formReset.confirmPassword = ''
  Object.keys(errorsReset).forEach(k => delete errorsReset[k])
  tampilPasswordBaru.value = false
  formResetTerbuka.value = true
}

function validateReset(): boolean {
  Object.keys(errorsReset).forEach(k => delete errorsReset[k])
  if (!formReset.newPassword) errorsReset.newPassword = 'Password baru wajib diisi'
  else if (formReset.newPassword.length < 6) errorsReset.newPassword = 'Password minimal 6 karakter'
  if (!formReset.confirmPassword) errorsReset.confirmPassword = 'Konfirmasi password wajib diisi'
  else if (formReset.newPassword !== formReset.confirmPassword) errorsReset.confirmPassword = 'Password tidak cocok'
  return Object.keys(errorsReset).length === 0
}

async function handleResetPassword() {
  if (!validateReset() || !userDipilih.value) return
  sedangReset.value = true
  try {
    await $fetch(`/api/users/${userDipilih.value.id}/reset-password`, {
      method: 'PUT',
      body: { newPassword: formReset.newPassword }
    })
    toast({ title: 'Berhasil', description: `Password ${userDipilih.value.name} berhasil direset`, variant: 'success' })
    formResetTerbuka.value = false
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  } finally {
    sedangReset.value = false
  }
}

// HAPUS
function bukaDialogHapus(user: User) {
  userAkanDihapus.value = user
  dialogHapusTerbuka.value = true
}

async function handleHapus() {
  if (!userAkanDihapus.value) return
  sedangMenghapus.value = true
  try {
    await $fetch(`/api/users/${userAkanDihapus.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'User berhasil dihapus', variant: 'success' })
    dialogHapusTerbuka.value = false
    userAkanDihapus.value = null
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  } finally {
    sedangMenghapus.value = false
  }
}

onMounted(ambilData)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>