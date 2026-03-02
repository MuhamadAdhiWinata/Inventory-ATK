<template>
  <main class="p-4 md:p-6">
    <div class="flex items-center justify-between border-b pb-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-900/20 flex items-center justify-center">
          <WarehouseIcon class="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Gudang</h1>
          <p class="text-muted-foreground text-sm">Kelola daftar gudang penyimpanan.</p>
        </div>
      </div>
      <button @click="bukaFormTambah" class="inline-flex items-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors">
        <PlusIcon class="h-4 w-4" />
        Tambah Gudang
      </button>
    </div>

    <!-- Loading -->
    <div v-if="sedangMemuat" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>

    <!-- Error -->
    <div v-else-if="pesanError" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <p class="text-destructive font-semibold mb-2">Terjadi Kesalahan</p>
      <p class="text-sm text-muted-foreground mb-4">{{ pesanError }}</p>
      <button @click="ambilData" class="rounded-md text-sm bg-primary text-primary-foreground h-9 px-4">Coba Lagi</button>
    </div>

    <!-- Table -->
    <div v-else class="border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b bg-muted/50">
          <tr>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Nama Gudang</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">location</th>
            <th class="h-11 px-4 text-center font-medium text-muted-foreground">Jumlah Item</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="gudang in daftarGudang" :key="gudang.id" class="border-b transition-colors hover:bg-muted/50">
            <td class="p-4 font-medium">{{ gudang.name }}</td>
            <td class="p-4 text-muted-foreground">{{ gudang.location ?? '-' }}</td>
            <td class="p-4 text-center">
              <span class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {{ gudang.jumlahItem }} item
              </span>
            </td>
            <td class="p-4">
              <div class="flex gap-2">
                <button @click="bukaFormEdit(gudang)" class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors">
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button @click="bukaDialogHapus(gudang)" class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <Trash2Icon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="daftarGudang.length === 0" class="text-center py-12 text-sm text-muted-foreground">
        Belum ada gudang. Tambahkan gudang pertama Anda.
      </div>
    </div>

    <!-- Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formTerbuka" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="tutupForm" />
          <div class="relative z-10 w-full max-w-md mx-4 bg-card rounded-lg shadow-xl border border-border">
            <div class="flex items-center justify-between p-6 border-b">
              <h2 class="text-lg font-semibold">{{ isEditMode ? 'Edit Gudang' : 'Tambah Gudang' }}</h2>
              <button @click="tutupForm" class="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
                <XIcon class="h-5 w-5" />
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Nama Gudang <span class="text-destructive">*</span></label>
                <input v-model="form.nama" type="text" placeholder="Contoh: Gudang Utama"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.nama }" />
                <p v-if="errors.nama" class="text-xs text-destructive">{{ errors.nama }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">location</label>
                <input v-model="form.location" type="text" placeholder="Contoh: Gedung A Lt. 1"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="tutupForm" class="rounded-md text-sm border border-input bg-background hover:bg-accent h-9 px-4 transition-colors">Batal</button>
                <button type="submit" :disabled="sedangMenyimpan" class="rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors disabled:opacity-50">
                  <span v-if="sedangMenyimpan" class="inline-block h-3.5 w-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin align-middle" />
                  {{ sedangMenyimpan ? 'Menyimpan...' : isEditMode ? 'Simpan' : 'Tambah' }}
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
      title="Hapus Gudang"
      :description="`Hapus gudang '${gudangAkanDihapus?.name}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="sedangMenghapus"
      @confirm="handleHapus"
      @cancel="dialogHapusTerbuka = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
import { WarehouseIcon, PlusIcon, PencilIcon, Trash2Icon, XIcon } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

interface Gudang { id: number; name: string; location: string | null; jumlahItem: number }

const daftarGudang = ref<Gudang[]>([])
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)

const formTerbuka = ref(false)
const isEditMode = ref(false)
const sedangMenyimpan = ref(false)
const gudangDipilih = ref<Gudang | null>(null)

const dialogHapusTerbuka = ref(false)
const gudangAkanDihapus = ref<Gudang | null>(null)
const sedangMenghapus = ref(false)

const form = reactive({ nama: '', location: '' })
const errors = reactive<Record<string, string>>({})

const ambilData = async () => {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    daftarGudang.value = await $fetch<Gudang[]>('/api/gudang')
  } catch (err) {
    pesanError.value = 'Gagal memuat data gudang.'
  } finally {
    sedangMemuat.value = false
  }
}

function bukaFormTambah() {
  isEditMode.value = false
  gudangDipilih.value = null
  form.nama = ''
  form.location = ''
  Object.keys(errors).forEach(k => delete errors[k])
  formTerbuka.value = true
}

function bukaFormEdit(gudang: Gudang) {
  isEditMode.value = true
  gudangDipilih.value = gudang
  form.nama = gudang.name
  form.location = gudang.location ?? ''
  Object.keys(errors).forEach(k => delete errors[k])
  formTerbuka.value = true
}

function tutupForm() {
  if (sedangMenyimpan.value) return
  formTerbuka.value = false
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.nama.trim()) errors.nama = 'Nama gudang wajib diisi'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  sedangMenyimpan.value = true
  try {
    if (isEditMode.value && gudangDipilih.value) {
      await $fetch(`/api/gudang/${gudangDipilih.value.id}`, { method: 'PUT', body: form })
      toast({ title: 'Berhasil', description: 'Gudang berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/gudang', { method: 'POST', body: form })
      toast({ title: 'Berhasil', description: 'Gudang berhasil ditambahkan', variant: 'success' })
    }
    formTerbuka.value = false
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  } finally {
    sedangMenyimpan.value = false
  }
}

function bukaDialogHapus(gudang: Gudang) {
  gudangAkanDihapus.value = gudang
  dialogHapusTerbuka.value = true
}

async function handleHapus() {
  if (!gudangAkanDihapus.value) return
  sedangMenghapus.value = true
  try {
    await $fetch(`/api/gudang/${gudangAkanDihapus.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'Gudang berhasil dihapus', variant: 'success' })
    dialogHapusTerbuka.value = false
    gudangAkanDihapus.value = null
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