<template>
  <main class="p-4 md:p-6">
    <div class="flex items-center justify-between border-b pb-4 mb-6">
      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
          <LayoutGridIcon class="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Sub Kategori</h1>
          <p class="text-muted-foreground text-sm">Kelola sub kategori barang.</p>
        </div>
      </div>
      <button @click="bukaFormTambah" class="inline-flex items-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors">
        <PlusIcon class="h-4 w-4" />
        Tambah Sub Kategori
      </button>
    </div>

    <!-- Filter Kategori -->
    <div class="mb-4">
      <select v-model="filterKategori" class="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <option value="">Semua Kategori</option>
        <option v-for="k in daftarKategori" :key="k.id" :value="k.id">{{ k.name }}</option>
      </select>
    </div>

    <div v-if="sedangMemuat" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="pesanError" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <p class="text-destructive font-semibold mb-2">Terjadi Kesalahan</p>
      <p class="text-sm text-muted-foreground mb-4">{{ pesanError }}</p>
      <button @click="ambilData" class="rounded-md text-sm bg-primary text-primary-foreground h-9 px-4">Coba Lagi</button>
    </div>

    <div v-else class="border rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="border-b bg-muted/50">
          <tr>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Nama Sub Kategori</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Kategori</th>
            <th class="h-11 px-4 text-center font-medium text-muted-foreground">Jumlah Barang</th>
            <th class="h-11 px-4 text-left font-medium text-muted-foreground">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dataFiltered" :key="item.id" class="border-b transition-colors hover:bg-muted/50">
            <td class="p-4 font-medium">{{ item.name }}</td>
            <td class="p-4">
              <span class="inline-flex items-center rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 px-2 py-0.5 text-xs font-medium">
                {{ item.kategoriNama }}
              </span>
            </td>
            <td class="p-4 text-center">
              <span class="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {{ item.jumlahBarang }} barang
              </span>
            </td>
            <td class="p-4">
              <div class="flex gap-2">
                <button @click="bukaFormEdit(item)" class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors">
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button @click="bukaDialogHapus(item)" class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <Trash2Icon class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="dataFiltered.length === 0" class="text-center py-12 text-sm text-muted-foreground">
        Belum ada sub kategori.
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="formTerbuka" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="tutupForm" />
          <div class="relative z-10 w-full max-w-md mx-4 bg-card rounded-lg shadow-xl border border-border">
            <div class="flex items-center justify-between p-6 border-b">
              <h2 class="text-lg font-semibold">{{ isEditMode ? 'Edit Sub Kategori' : 'Tambah Sub Kategori' }}</h2>
              <button @click="tutupForm" class="rounded-md p-1.5 hover:bg-accent text-muted-foreground">
                <XIcon class="h-5 w-5" />
              </button>
            </div>
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Kategori <span class="text-destructive">*</span></label>
                <select
                  :value="form.kategoriId"
                  @change="(e) => form.kategoriId = Number((e.target as HTMLSelectElement).value)"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.kategoriId }"
                >
                  <option :value="null" disabled>Pilih kategori</option>
                  <option v-for="k in daftarKategori" :key="k.id" :value="k.id">{{ k.name }}</option>
                </select>
                <p v-if="errors.kategoriId" class="text-xs text-destructive">{{ errors.kategoriId }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Nama Sub Kategori <span class="text-destructive">*</span></label>
                <input v-model="form.name" type="text" placeholder="Contoh: Pena & Pensil"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.name }" />
                <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
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

    <ConfirmDialog
      :is-open="dialogHapusTerbuka"
      title="Hapus Sub Kategori"
      :description="`Hapus sub kategori '${itemAkanDihapus?.name}'? Semua barang di dalamnya harus dipindahkan terlebih dahulu.`"
      :loading="sedangMenghapus"
      @confirm="handleHapus"
      @cancel="dialogHapusTerbuka = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth']
})
import { LayoutGridIcon, PlusIcon, PencilIcon, Trash2Icon, XIcon } from 'lucide-vue-next'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

interface SubKategori { id: number; name: string; kategoriId: number; kategoriNama: string; jumlahBarang: number }
interface Kategori { id: number; name: string }

const daftarSubKategori = ref<SubKategori[]>([])
const daftarKategori = ref<Kategori[]>([])
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)
const filterKategori = ref<number | ''>('')

const formTerbuka = ref(false)
const isEditMode = ref(false)
const sedangMenyimpan = ref(false)
const itemDipilih = ref<SubKategori | null>(null)

const dialogHapusTerbuka = ref(false)
const itemAkanDihapus = ref<SubKategori | null>(null)
const sedangMenghapus = ref(false)

const form = reactive({ name: '', kategoriId: null as number | null })
const errors = reactive<Record<string, string>>({})

const dataFiltered = computed(() => {
  if (!filterKategori.value) return daftarSubKategori.value
  return daftarSubKategori.value.filter(s => s.kategoriId === Number(filterKategori.value))
})

const ambilData = async () => {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    const [subKat, kat] = await Promise.all([
      $fetch<SubKategori[]>('/api/sub-categories'),
      $fetch<Kategori[]>('/api/categories')
    ])
    daftarSubKategori.value = subKat
    daftarKategori.value = kat
  } catch {
    pesanError.value = 'Gagal memuat data.'
  } finally {
    sedangMemuat.value = false
  }
}

function bukaFormTambah() {
  isEditMode.value = false
  itemDipilih.value = null
  form.name = ''
  form.kategoriId = null
  Object.keys(errors).forEach(k => delete errors[k])
  formTerbuka.value = true
}

function bukaFormEdit(item: SubKategori) {
  isEditMode.value = true
  itemDipilih.value = item
  form.name = item.name
  form.kategoriId = item.kategoriId
  Object.keys(errors).forEach(k => delete errors[k])
  formTerbuka.value = true
}

function tutupForm() {
  if (sedangMenyimpan.value) return
  formTerbuka.value = false
}

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.kategoriId) errors.kategoriId = 'Kategori wajib dipilih'
  if (!form.name.trim()) errors.name = 'Nama sub kategori wajib diisi'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  sedangMenyimpan.value = true
  try {
    if (isEditMode.value && itemDipilih.value) {
      await $fetch(`/api/sub-categories/${itemDipilih.value.id}`, { method: 'PUT', body: form })
      toast({ title: 'Berhasil', description: 'Sub kategori berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/sub-categories', { method: 'POST', body: form })
      toast({ title: 'Berhasil', description: 'Sub kategori berhasil ditambahkan', variant: 'success' })
    }
    formTerbuka.value = false
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  } finally {
    sedangMenyimpan.value = false
  }
}

function bukaDialogHapus(item: SubKategori) {
  itemAkanDihapus.value = item
  dialogHapusTerbuka.value = true
}

async function handleHapus() {
  if (!itemAkanDihapus.value) return
  sedangMenghapus.value = true
  try {
    await $fetch(`/api/sub-categories/${itemAkanDihapus.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'Sub kategori berhasil dihapus', variant: 'success' })
    dialogHapusTerbuka.value = false
    itemAkanDihapus.value = null
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