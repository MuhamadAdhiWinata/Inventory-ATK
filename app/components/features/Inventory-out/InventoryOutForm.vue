<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="handleClose" />

        <!-- Modal -->
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
            <!-- Barang -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">
                Barang <span class="text-destructive">*</span>
              </label>
              <select
                :value="form.itemId"
                @change="(e) => form.itemId = Number((e.target as HTMLSelectElement).value)"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :class="{ 'border-destructive': errors.itemId }"
              >
                <option :value="null" disabled>Pilih barang</option>
                <option v-for="barang in itemList" :key="barang.id" :value="barang.id">
                  {{ barang.code }} - {{ barang.name }}
                </option>
              </select>
              <p v-if="errors.itemId" class="text-xs text-destructive">{{ errors.itemId }}</p>
            </div>

            <!-- Gudang Asal & Quantity -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">Gudang Asal</label>
                <select
                  :value="form.gudangId"
                  @change="(e) => form.gudangId = Number((e.target as HTMLSelectElement).value)"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option :value="null">Pilih gudang</option>
                  <option v-for="gudang in gudangList" :key="gudang.id" :value="gudang.id">
                    {{ gudang.name }}
                  </option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Quantity <span class="text-destructive">*</span>
                </label>
                <input
                  v-model.number="form.quantity"
                  type="number"
                  min="1"
                  placeholder="0"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.quantity }"
                />
                <p v-if="errors.quantity" class="text-xs text-destructive">{{ errors.quantity }}</p>
              </div>
            </div>

            <!-- Tanggal -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">
                Tanggal <span class="text-destructive">*</span>
              </label>
              <input
                v-model="form.date"
                type="date"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :class="{ 'border-destructive': errors.date }"
              />
              <p v-if="errors.date" class="text-xs text-destructive">{{ errors.date }}</p>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">Description</label>
              <input
                v-model="form.description"
                type="text"
                placeholder="Contoh: Distribusi ke kelas X IPA 1"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <!-- Note -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">Note</label>
              <textarea
                v-model="form.note"
                placeholder="Catatan tambahan..."
                rows="2"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                @click="handleClose"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
import { X } from 'lucide-vue-next'
import type { InventoryTransaction, GudangItem } from '#shared/types/IInventory'

interface ItemOption {
  id: number
  code: string
  name: string
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

const today = new Date().toISOString().split('T')[0]

const defaultForm = {
  itemId: null as number | null,
  gudangId: null as number | null,
  quantity: 1,
  date: today,
  description: '',
  note: '',
}

const form = reactive({ ...defaultForm })
const errors = reactive<Record<string, string>>({})

watch(() => props.transaction, (transaksi) => {
  if (transaksi) {
    form.itemId = transaksi.itemId
    form.gudangId = transaksi.gudangId
    form.quantity = transaksi.quantity
    form.date = transaksi.date.split('T')[0]
    form.description = transaksi.description ?? ''
    form.note = transaksi.note ?? ''
  } else {
    Object.assign(form, defaultForm)
  }
}, { immediate: true })

watch(() => props.isOpen, (terbuka) => {
  if (!terbuka) {
    Object.assign(form, defaultForm)
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.itemId) errors.itemId = 'Barang wajib dipilih'
  if (!form.quantity || form.quantity < 1) errors.quantity = 'Quantity minimal 1'
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