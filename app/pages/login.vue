<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-background via-background to-primary/5">
    <div class="w-full max-w-sm">
      <div class="flex flex-col gap-6">
        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          <Card class="border-border/50 shadow-lg">
            <CardContent class="py-8">
              <!-- Logo & Title -->
              <div class="flex flex-col items-center gap-2 text-center pb-6">
                <div class="mb-4">
                  <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                      <img src="../assets/logo_smk_pakem.png" alt="Inventory App" class="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 class="text-2xl font-bold text-card-foreground mb-1">Inventory App</h1>
                  <p class="text-sm text-muted-foreground">Sistem Inventory ATK</p>
                </div>
              </div>

              <div class="grid gap-6">
                <!-- Identifier: username atau email -->
                <div class="grid gap-3">
                  <Label for="identifier" class="text-sm font-medium text-card-foreground">
                    Username / Email
                  </Label>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <Input
                      id="identifier"
                      v-model="formData.identifier"
                      type="text"
                      placeholder="Username atau email"
                      :class="{ 'border-destructive focus-visible:ring-destructive/20': errors.identifier }"
                      :disabled="submitting"
                      autocomplete="username"
                      required
                      class="pl-10"
                    />
                  </div>
                  <p v-if="errors.identifier" class="text-sm text-destructive">
                    {{ errors.identifier }}
                  </p>
                </div>

                <!-- Password -->
                <div class="grid gap-3">
                  <div class="flex items-center">
                    <Label for="password" class="text-sm font-medium text-card-foreground">
                      Password
                    </Label>
                  </div>
                  <div class="relative">
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <Input
                      id="password"
                      v-model="formData.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Masukkan password"
                      :class="{ 'border-destructive focus-visible:ring-destructive/20': errors.password }"
                      :disabled="submitting"
                      autocomplete="current-password"
                      required
                      class="pl-10 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      class="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      @click="showPassword = !showPassword"
                      :disabled="submitting"
                      tabindex="-1"
                    >
                      <Eye v-if="!showPassword" class="h-4 w-4" />
                      <EyeOff v-else class="h-4 w-4" />
                    </Button>
                  </div>
                  <p v-if="errors.password" class="text-sm text-destructive">
                    {{ errors.password }}
                  </p>
                </div>

                <!-- Error global -->
                <div v-if="pesanError" class="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
                    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                  {{ pesanError }}
                </div>

                <!-- Submit -->
                <Button
                  type="submit"
                  class="w-full h-11 text-sm font-semibold mt-2"
                  :disabled="submitting"
                >
                  <div v-if="submitting" class="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>{{ submitting ? 'Masuk...' : 'Masuk' }}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Footer -->
          <div class="text-balance text-center text-xs text-muted-foreground">
            Belum Punya Akun?
            <span class="font-medium text-primary hover:text-primary/80 cursor-pointer ml-1">
              Hubungi Bagian Pusat
            </span>
            <div class="mt-2 text-[11px] text-muted-foreground/70">
              © 2026 Inventory App. Sistem Inventory ATK.
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: []
})

import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isLoggedIn) navigateTo('/dashboard')
})

const submitting = ref(false)
const showPassword = ref(false)
const pesanError = ref('')

const formData = reactive({ identifier: '', password: '' })
const errors = reactive({ identifier: '', password: '' })

function validateForm(): boolean {
  errors.identifier = ''
  errors.password = ''
  pesanError.value = ''
  let valid = true
  if (!formData.identifier.trim()) {
    errors.identifier = 'Username atau email wajib diisi'
    valid = false
  }
  if (!formData.password) {
    errors.password = 'Password wajib diisi'
    valid = false
  }
  return valid
}

async function handleLogin() {
  if (!validateForm()) return
  submitting.value = true
  try {
    await authStore.login(formData.identifier, formData.password)
    await navigateTo('/dashboard')
  } catch (err: any) {
    pesanError.value = err.data?.message ?? 'Username/email atau password salah'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:deep(input:focus) {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 20%, transparent);
}
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>