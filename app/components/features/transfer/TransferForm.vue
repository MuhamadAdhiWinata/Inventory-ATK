<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />

        <div class="relative z-10 w-full max-w-lg mx-4 bg-card rounded-lg shadow-xl border border-border">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 class="text-lg font-semibold">
                {{ isEditMode ? 'Edit Transfer' : 'Transfer Antar Gudang' }}
              </h2>
              <p class="text-sm text-muted-foreground mt-0.5">
                Pindahkan barang dari satu gudang ke gudang lain
              </p>
            </div>
            <button @click="handleClose" class="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Barang -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">
                Barang <span class="text-destructive">*</span>
              </label>
              <select
                :value="form.itemId"
                @change="(e) => onBarangChange(Number((e.target as HTMLSelectElement).value))"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :class="{ 'border-destructive': errors.itemId }"
              >
                <option :value="null" disabled>Pilih barang</option>
                <option v-for="barang in itemList" :key="barang.id" :value="barang.id">
                  {{ barang.code }} - {{ barang.name }}
                </option>
              </select>
              <p v-if="errors.itemId" class="text-xs text-destructive">{{ errors.itemId }}</p>
            </div>

            <!-- Gudang Asal & Tujuan -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  Gudang Asal <span class="text-destructive">*</span>
                </label>
                <select
                  :value="form.gudangId"
                  @change="(e) => form.gudangId = Number((e.target as HTMLSelectElement).value)"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.gudangId }"
                >
                  <option :value="null" disabled>Pilih gudang</option>
                  <option
                    v-for="gudang in gudangList"
                    :key="gudang.id"
                    :value="gudang.id"
                    :disabled="gudang.id === form.gudangTujuanId"
                  >
                    {{ gudang.name }}
                    <template v-if="stokGudangAsal(gudang.id) !== null">
                      ({{ stokGudangAsal(gudang.id) }} {{ satuanDipilih }})
                    </template>
                  </option>
                </select>
                <p v-if="errors.gudangId" class="text-xs text-destructive">{{ errors.gudangId }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  Gudang Tujuan <span class="text-destructive">*</span>
                </label>
                <select
                  :value="form.gudangTujuanId"
                  @change="(e) => form.gudangTujuanId = Number((e.target as HTMLSelectElement).value)"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.gudangTujuanId }"
                >
                  <option :value="null" disabled>Pilih gudang</option>
                  <option
                    v-for="gudang in gudangList"
                    :key="gudang.id"
                    :value="gudang.id"
                    :disabled="gudang.id === form.gudangId"
                  >
                    {{ gudang.name }}
                  </option>
                </select>
                <p v-if="errors.gudangTujuanId" class="text-xs text-destructive">{{ errors.gudangTujuanId }}</p>
              </div>
            </div>

            <!-- Info stok tersedia -->
            <div v-if="form.itemId && form.gudangId && stokTersedia !== null" class="rounded-md bg-muted px-3 py-2 text-sm">
              <span class="text-muted-foreground">Stok tersedia di gudang asal: </span>
              <span class="font-semibold" :class="stokTersedia < form.quantity ? 'text-destructive' : 'text-foreground'">
                {{ stokTersedia }} {{ satuanDipilih }}
              </span>
            </div>

            <!-- Quantity & Tanggal -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  Quantity <span class="text-destructive">*</span>
                </label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.quantity }"
                />
                <p v-if="errors.quantity" class="text-xs text-destructive">{{ errors.quantity }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium">
                  Tanggal <span class="text-destructive">*</span>
                </label>
                <input
                  v-model="form.date"
                  type="date"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.date }"
                />
                <p v-if="errors.date" class="text-xs text-destructive">{{ errors.date }}</p>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Description</label>
              <input
                v-model="form.description"
                type="text"
                placeholder="Contoh: Rotasi stok antar gudang"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <!-- Note -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Note</label>
              <textarea
                v-model="form.note"
                placeholder="Catatan tambahan..."
                rows="2"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="handleClose"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="sedangMenyimpan"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 h-9 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="sedangMenyimpan" class="h-3.5 w-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {{ sedangMenyimpan ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Transfer Sekarang' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { InventoryTransaction, GudangItem } from '#shared/types/IInventory'

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
const sedangMenyimpan = ref(false)
const stokPerGudang = ref<StokGudang[]>([])
const hariIni = new Date().toISOString().split('T')[0]

const defaultForm = {
  itemId: null as number | null,
  gudangId: null as number | null,
  gudangTujuanId: null as number | null,
  quantity: 1,
  date: hariIni,
  description: '',
  note: '',
}

const form = reactive({ ...defaultForm })
const errors = reactive<Record<string, string>>({})

// Satuan barang yang dipilih
const satuanDipilih = computed(() => {
  const barang = props.itemList.find(b => b.id === form.itemId)
  return barang?.unit ?? ''
})

// Stok tersedia di gudang asal
const stokTersedia = computed(() => {
  if (!form.gudangId) return null
  const stok = stokPerGudang.value.find(s => s.gudangId === form.gudangId)
  return stok?.quantity ?? 0
})

// Stok gudang tertentu untuk ditampilkan di option
function stokGudangAsal(gudangId: number): number | null {
  if (!form.itemId) return null
  const stok = stokPerGudang.value.find(s => s.gudangId === gudangId)
  return stok?.quantity ?? 0
}

// Ambil stok saat barang dipilih
async function onBarangChange(itemId: number) {
  form.itemId = itemId
  form.gudangId = null
  form.gudangTujuanId = null
  stokPerGudang.value = []

  try {
    const hasil = await $fetch<any[]>('/api/stock', { params: { itemId } })
    stokPerGudang.value = hasil.map(s => ({
      gudangId: s.gudangId,
      quantity: s.quantity
    }))
  } catch (err) {
    console.error('Gagal ambil stok:', err)
  }
}

watch(() => props.transaction, async (transaksi) => {
  if (transaksi) {
    form.itemId = transaksi.itemId
    form.gudangId = transaksi.gudangId
    form.gudangTujuanId = transaksi.gudangTujuanId
    form.quantity = transaksi.quantity
    form.date = transaksi.date.split('T')[0]
    form.description = transaksi.description ?? ''
    form.note = transaksi.note ?? ''
    if (transaksi.itemId) await onBarangChange(transaksi.itemId)
  } else {
    Object.assign(form, defaultForm)
    stokPerGudang.value = []
  }
}, { immediate: true })

watch(() => props.isOpen, (terbuka) => {
  if (!terbuka) {
    Object.assign(form, defaultForm)
    stokPerGudang.value = []
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.itemId) errors.itemId = 'Barang wajib dipilih'
  if (!form.gudangId) errors.gudangId = 'Gudang asal wajib dipilih'
  if (!form.gudangTujuanId) errors.gudangTujuanId = 'Gudang tujuan wajib dipilih'
  if (form.gudangId && form.gudangTujuanId && form.gudangId === form.gudangTujuanId) {
    errors.gudangTujuanId = 'Gudang tujuan tidak boleh sama dengan gudang asal'
  }
  if (!form.quantity || form.quantity < 1) errors.quantity = 'Quantity minimal 1'
  if (stokTersedia.value !== null && form.quantity > stokTersedia.value) {
    errors.quantity = `Stok tidak cukup (tersedia: ${stokTersedia.value})`
  }
  if (!form.date) errors.date = 'Tanggal wajib diisi'
  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  sedangMenyimpan.value = true
  try {
    await emit('submit', { ...form })
  } finally {
    sedangMenyimpan.value = false
  }
}

function handleClose() {
  if (sedangMenyimpan.value) return
  emit('close')
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>