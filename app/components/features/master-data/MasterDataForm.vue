<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleClose"
        />

        <!-- Modal -->
        <div class="relative z-10 w-full max-w-md mx-4 bg-card rounded-lg shadow-xl border border-border">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 class="text-lg font-semibold text-card-foreground">
                {{ isEditMode ? 'Edit Barang' : 'Tambah Barang' }}
              </h2>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ isEditMode ? 'Ubah informasi barang' : 'Tambahkan barang baru ke inventaris' }}
              </p>
            </div>
            <button
              @click="handleClose"
              class="rounded-md p-1.5 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Nama Barang -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">
                Nama Barang <span class="text-destructive">*</span>
              </label>
              <input
                v-model="form.namaBarang"
                type="text"
                placeholder="Contoh: Pulpen Pilot G2"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :class="{ 'border-destructive': errors.namaBarang }"
              />
              <p v-if="errors.namaBarang" class="text-xs text-destructive">{{ errors.namaBarang }}</p>
            </div>

            <!-- Kategori & Sub Kategori -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Kategori <span class="text-destructive">*</span>
                </label>
                <select
                  :value="form.kategoriId"
                  @change="(e) => { form.kategoriId = Number((e.target as HTMLSelectElement).value); form.subKategoriId = null }"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.kategoriId }"
                >
                  <option :value="null" disabled>Pilih kategori</option>
                  <option v-for="k in kategoriList" :key="k.id" :value="k.id">
                    {{ k.name }}
                  </option>
                </select>
                <p v-if="errors.kategoriId" class="text-xs text-destructive">{{ errors.kategoriId }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Sub Kategori <span class="text-destructive">*</span>
                </label>
                <select
                  :value="form.subKategoriId"
                  @change="(e) => form.subKategoriId = Number((e.target as HTMLSelectElement).value)"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="{ 'border-destructive': errors.subKategoriId }"
                  :disabled="!form.kategoriId"
                >
                  <option :value="null" disabled>Pilih sub kategori</option>
                  <option v-for="sk in filteredSubKategori" :key="sk.id" :value="sk.id">
                    {{ sk.name }}
                  </option>
                </select>
                <p v-if="errors.subKategoriId" class="text-xs text-destructive">{{ errors.subKategoriId }}</p>
              </div>
            </div>

            <!-- Satuan -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium text-card-foreground">
                Satuan <span class="text-destructive">*</span>
              </label>
              <select
                :value="form.satuanId"
                @change="(e) => form.satuanId = Number((e.target as HTMLSelectElement).value)"
                class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                :class="{ 'border-destructive': errors.satuanId }"
              >
                <option :value="null" disabled>Pilih satuan</option>
                <option v-for="u in satuanList" :key="u.id" :value="u.id">
                  {{ u.name }}
                </option>
              </select>
              <p v-if="errors.satuanId" class="text-xs text-destructive">{{ errors.satuanId }}</p>
            </div>

            <!-- Stok -->
            <!-- <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Stok Awal <span class="text-destructive">*</span>
                </label>
                <input
                  v-model.number="form.currentStock"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.currentStock }"
                />
                <p v-if="errors.currentStock" class="text-xs text-destructive">{{ errors.currentStock }}</p>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-medium text-card-foreground">
                  Stok Minimum <span class="text-destructive">*</span>
                </label>
                <input
                  v-model.number="form.stokMin"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  :class="{ 'border-destructive': errors.stokMin }"
                />
                <p v-if="errors.stokMin" class="text-xs text-destructive">{{ errors.stokMin }}</p>
              </div>
            </div> -->

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
                class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div
                  v-if="submitting"
                  class="h-3.5 w-3.5 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"
                />
                {{ submitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Barang' }}
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
import type { MasterItem } from '#shared/types/IMasterData'
import type { KategoriItem, SubKategoriItem, SatuanItem } from '@/services/masterDataService'

interface Props {
  isOpen: boolean
  item?: MasterItem | null
  kategoriList: KategoriItem[]
  subKategoriList: SubKategoriItem[]
  satuanList: SatuanItem[]
}

const props = withDefaults(defineProps<Props>(), {
  item: null
})

const emit = defineEmits<{
  close: []
  submit: [data: any]
}>()

const isEditMode = computed(() => !!props.item)
const submitting = ref(false)

const defaultForm = {
  namaBarang: '',
  kategoriId: null as number | null,
  subKategoriId: null as number | null,
  satuanId: null as number | null,
  currentStock: 0,
  stokMin: 0,
}

const form = reactive({ ...defaultForm })
const errors = reactive<Record<string, string>>({})

const filteredSubKategori = computed(() => {
  if (!form.kategoriId) return []
  return props.subKategoriList.filter(sk => Number(sk.kategoriId) === Number(form.kategoriId))
  //                                              ^^^^^^^^^^^ ganti dari categoryId
})

// Populate form saat edit
watch(() => props.item, (item) => {
  if (item) {
    form.namaBarang = item.namaBarang
    // form.currentStock = item.currentStock
    form.stokMin = item.stokMin

    const subKat = props.subKategoriList.find(sk => sk.name === item.subKategori)
    if (subKat) {
      form.kategoriId = subKat.kategoriId
      form.subKategoriId = subKat.id
    }

    const satuan = props.satuanList.find(u => u.name === item.satuan)
    if (satuan) form.satuanId = satuan.id

  } else {
    Object.assign(form, defaultForm)
  }
}, { immediate: true })

// Reset form saat modal ditutup
watch(() => props.isOpen, (open) => {
  if (!open) {
    Object.assign(form, defaultForm)
    Object.keys(errors).forEach(k => delete errors[k])
  }
})

function validate(): boolean {
  Object.keys(errors).forEach(k => delete errors[k])

  if (!form.namaBarang.trim()) errors.namaBarang = 'Nama barang wajib diisi'
  if (!form.kategoriId) errors.kategoriId = 'Kategori wajib dipilih'
  if (!form.subKategoriId) errors.subKategoriId = 'Sub kategori wajib dipilih'
  if (!form.satuanId) errors.satuanId = 'Satuan wajib dipilih'
  if (form.currentStock < 0) errors.currentStock = 'Stok tidak boleh negatif'
  if (form.stokMin < 0) errors.stokMin = 'Stok minimum tidak boleh negatif'

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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>