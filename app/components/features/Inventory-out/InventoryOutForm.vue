<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />

        <div class="relative z-10 w-full max-w-lg mx-4 bg-card rounded-lg shadow-xl border border-border">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 class="text-lg font-semibold text-card-foreground">
                {{ isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi Keluar' }}
              </h2>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ isEditMode ? 'Ubah data transaksi' : 'Catat barang keluar dari gudang' }}
              </p>
            </div>
            <button @click="handleClose" class="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">

            <!-- Barang — SearchableSelect -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">
                Barang <span class="text-destructive">*</span>
              </label>
              <SearchableSelect
                :model-value="form.itemId"
                :options="barangOptions"
                placeholder="Cari nama atau kode barang..."
                search-placeholder="Ketik nama atau kode barang..."
                :has-error="!!errors.itemId"
                @change="(val) => onBarangChange(Number(val))"
              />
              <p v-if="errors.itemId" class="text-xs text-destructive">{{ errors.itemId }}</p>
            </div>

            <!-- Gudang Asal -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">Gudang Asal</label>

              <div v-if="sedangMuatStok" class="h-9 rounded-md border border-input bg-muted animate-pulse" />

              <select
                v-else
                :value="form.gudangId"
                @change="(e) => form.gudangId = Number((e.target as HTMLSelectElement).value)"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option :value="null">Pilih gudang</option>
                <option v-for="g in gudangList" :key="g.id" :value="g.id">
                  {{ g.name }}
                  <template v-if="form.itemId">
                    — Stok: {{ getStokGudang(g.id) }} {{ satuanDipilih }}
                  </template>
                </option>
              </select>

              <!-- Info stok -->
              <div
                v-if="form.itemId && form.gudangId && !sedangMuatStok"
                class="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
                :class="stokTersedia === 0
                  ? 'bg-destructive/10 text-destructive'
                  : stokTersedia <= minStokBarang
                    ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400'
                    : 'bg-muted text-foreground'"
              >
                <WarehouseIcon class="h-4 w-4 shrink-0" />
                <span>
                  Stok tersedia:
                  <span class="font-semibold">{{ stokTersedia }} {{ satuanDipilih }}</span>
                  <span v-if="stokTersedia === 0" class="ml-1">(kosong)</span>
                  <span v-else-if="stokTersedia <= minStokBarang" class="ml-1">(hampir habis)</span>
                </span>
              </div>
            </div>

            <!-- Quantity & Tanggal -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Quantity <span class="text-destructive">*</span>
                </label>
                <input
                  v-model.number="form.quantity"
                  type="number" min="1" placeholder="0"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.quantity }"
                />
                <p v-if="errors.quantity" class="text-xs text-destructive">{{ errors.quantity }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Tanggal <span class="text-destructive">*</span>
                </label>
                <input
                  v-model="form.date" type="date"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.date }"
                />
                <p v-if="errors.date" class="text-xs text-destructive">{{ errors.date }}</p>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">Description</label>
              <input
                v-model="form.description" type="text"
                placeholder="Contoh: Distribusi ke kelas X IPA 1"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <!-- Note -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">Note</label>
              <textarea
                v-model="form.note" placeholder="Catatan tambahan..." rows="2"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="handleClose"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 transition-colors">
                Batal
              </button>
              <button type="submit" :disabled="submitting"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <div v-if="submitting" class="h-3.5 w-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {{ submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Transaksi' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, WarehouseIcon } from 'lucide-vue-next'
import type { InventoryTransaction, GudangItem } from '#shared/types/IInventory'
import SearchableSelect from '@/components/ui/SearchableSelect.vue'
import type { SelectOption } from '@/components/ui/SearchableSelect.vue'

interface ItemOption {
  id: number
  code: string
  name: string
  unit: string
}

interface StokGudang {
  gudangId: number
  quantity: number
}

interface Props {
  isOpen: boolean
  transaction?: InventoryTransaction | null
  itemList: ItemOption[]
  gudangList: GudangItem[]
}

const props = withDefaults(defineProps<Props>(), { transaction: null })

const emit = defineEmits<{
  close: []
  submit: [data: any]
}>()

const isEditMode = computed(() => !!props.transaction)
const submitting = ref(false)
const sedangMuatStok = ref(false)
const stokPerGudang = ref<StokGudang[]>([])
const minStokBarang = ref(0)
const hariIni = new Date().toISOString().split('T')[0]

const defaultForm = {
  itemId: null as number | null,
  gudangId: null as number | null,
  quantity: 1,
  date: hariIni,
  description: '',
  note: '',
}

const form = reactive({ ...defaultForm })
const errors = reactive<Record<string, string>>({})

// Konversi itemList → SelectOption
const barangOptions = computed<SelectOption[]>(() =>
  props.itemList.map(b => ({
    value: b.id,
    label: b.name,
    sublabel: b.code,
  }))
)

const satuanDipilih = computed(() =>
  props.itemList.find(b => b.id === form.itemId)?.unit ?? ''
)

const stokTersedia = computed(() => {
  if (!form.gudangId) return 0
  return stokPerGudang.value.find(s => s.gudangId === form.gudangId)?.quantity ?? 0
})

function getStokGudang(gudangId: number): number {
  return stokPerGudang.value.find(s => s.gudangId === gudangId)?.quantity ?? 0
}

async function onBarangChange(itemId: number) {
  form.itemId = itemId
  form.gudangId = null
  stokPerGudang.value = []
  sedangMuatStok.value = true
  try {
    const hasil = await $fetch<any[]>('/api/stock', { params: { itemId } })
    stokPerGudang.value = hasil.map(s => ({ gudangId: s.gudangId, quantity: s.quantity }))
    minStokBarang.value = hasil[0]?.minStock ?? 0
  } catch (err) {
    console.error('Gagal ambil stok:', err)
  } finally {
    sedangMuatStok.value = false
  }
}

watch(() => props.transaction, async (tx) => {
  if (tx) {
    form.itemId = tx.itemId
    form.gudangId = tx.gudangId
    form.quantity = tx.quantity
    form.date = tx.date.split('T')[0]
    form.description = tx.description ?? ''
    form.note = tx.note ?? ''
    if (tx.itemId) {
      await onBarangChange(tx.itemId)
      form.gudangId = tx.gudangId // restore setelah onBarangChange reset
    }
  } else {
    Object.assign(form, defaultForm)
    stokPerGudang.value = []
  }
}, { immediate: true })

watch(() => props.isOpen, (open) => {
  if (!open) {
    Object.assign(form, defaultForm)
    stokPerGudang.value = []
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.itemId) errors.itemId = 'Barang wajib dipilih'
  if (!form.quantity || form.quantity < 1) errors.quantity = 'Quantity minimal 1'
  if (form.gudangId && stokTersedia.value < form.quantity) {
    errors.quantity = `Stok tidak cukup (tersedia: ${stokTersedia.value} ${satuanDipilih.value})`
  }
  if (!form.date) errors.date = 'Tanggal wajib diisi'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    await emit('submit', { ...form })
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  if (submitting.value) return
  emit('close')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>