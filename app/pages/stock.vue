<template>
  <main class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b pb-4 mb-6">
      <div class="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
        <WarehouseIcon class="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Stok Gudang</h1>
        <p class="text-muted-foreground text-sm">Pantau stok barang di setiap gudang secara real-time.</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1 max-w-md">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          v-model="kataPencarian"
          @input="onSearch"
          placeholder="Cari nama atau kode barang..."
          class="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <select
        v-model="filterGudang"
        @change="ambilData"
        class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Semua Gudang</option>
        <option v-for="gudang in daftarGudang" :key="gudang.id" :value="gudang.id">
          {{ gudang.name }}
        </option>
      </select>
      <select
        v-model="filterStatus"
        @change="ambilData"
        class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Semua Status</option>
        <option value="aman">Aman</option>
        <option value="restock">Perlu Restock</option>
        <option value="kosong">Kosong</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="sedangMemuat" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data stok...</p>
    </div>

    <!-- Error -->
    <div v-else-if="pesanError" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6 mb-6">
      <div class="flex items-center gap-2 text-destructive mb-2">
        <AlertCircleIcon class="h-5 w-5" />
        <h3 class="font-semibold">Terjadi Kesalahan</h3>
      </div>
      <p class="text-sm text-muted-foreground mb-4">{{ pesanError }}</p>
      <button @click="ambilData" class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
        Coba Lagi
      </button>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="rounded-lg border bg-card p-4">
          <p class="text-xs text-muted-foreground mb-1">Total Item</p>
          <p class="text-2xl font-bold">{{ ringkasan.totalItem }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-xs text-muted-foreground mb-1">Item Aman</p>
          <p class="text-2xl font-bold text-green-600">{{ ringkasan.itemAman }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-xs text-muted-foreground mb-1">Perlu Restock</p>
          <p class="text-2xl font-bold text-amber-500">{{ ringkasan.itemRestock }}</p>
        </div>
        <div class="rounded-lg border bg-card p-4">
          <p class="text-xs text-muted-foreground mb-1">Stok Kosong</p>
          <p class="text-2xl font-bold text-destructive">{{ ringkasan.itemKosong }}</p>
        </div>
      </div>

      <!-- Mode toggle: per item atau per gudang -->
      <div class="flex gap-2 mb-4">
        <button
          @click="modeView = 'item'"
          class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="modeView === 'item' ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-accent'"
        >
          <PackageIcon class="h-4 w-4" />
          Per Barang
        </button>
        <button
          @click="modeView = 'gudang'"
          class="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="modeView === 'gudang' ? 'bg-primary text-primary-foreground' : 'border border-input bg-background hover:bg-accent'"
        >
          <WarehouseIcon class="h-4 w-4" />
          Per Gudang
        </button>
      </div>

      <!-- View: Per Barang (pivot table) -->
      <div v-if="modeView === 'item'" class="border rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b bg-muted/50">
              <tr>
                <th class="h-11 px-4 text-left font-medium text-muted-foreground sticky left-0 bg-muted/50 min-w-[200px]">Barang</th>
                <th class="h-11 px-4 text-left font-medium text-muted-foreground">Satuan</th>
                <th class="h-11 px-4 text-left font-medium text-muted-foreground">Min Stok</th>
                <th
                  v-for="gudang in daftarGudangAktif"
                  :key="gudang.id"
                  class="h-11 px-4 text-center font-medium text-muted-foreground min-w-[120px]"
                >
                  {{ gudang.name }}
                </th>
                <th class="h-11 px-4 text-center font-medium text-muted-foreground">Total</th>
                <th class="h-11 px-4 text-center font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="baris in dataPerBarang"
                :key="baris.itemId"
                class="border-b transition-colors hover:bg-muted/30"
              >
                <td class="p-4 sticky left-0 bg-card hover:bg-muted/30">
                  <p class="font-medium">{{ baris.itemName }}</p>
                  <p class="text-xs text-muted-foreground">{{ baris.itemCode }}</p>
                </td>
                <td class="p-4 text-muted-foreground">{{ baris.unit }}</td>
                <td class="p-4 text-muted-foreground">{{ baris.minStock }}</td>
                <td
                  v-for="gudang in daftarGudangAktif"
                  :key="gudang.id"
                  class="p-4 text-center"
                >
                  <span :class="getWarnaStokGudang(baris.stokPerGudang[gudang.id] ?? 0)">
                    {{ baris.stokPerGudang[gudang.id] ?? 0 }}
                  </span>
                </td>
                <td class="p-4 text-center font-semibold">{{ baris.totalStok }}</td>
                <td class="p-4 text-center">
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="getBadgeStatus(baris.totalStok, baris.minStock)"
                  >
                    {{ getLabelStatus(baris.totalStok, baris.minStock) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty -->
        <div v-if="dataPerBarang.length === 0" class="text-center py-12">
          <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <PackageIcon class="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 class="font-semibold mb-1">Tidak Ada Data</h3>
          <p class="text-sm text-muted-foreground">Belum ada stok yang tercatat.</p>
        </div>
      </div>

      <!-- View: Per Gudang -->
      <div v-else class="space-y-4">
        <div
          v-for="gudang in daftarGudangAktif"
          :key="gudang.id"
          class="border rounded-lg overflow-hidden"
        >
          <div class="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
            <div class="flex items-center gap-2">
              <WarehouseIcon class="h-4 w-4 text-muted-foreground" />
              <h3 class="font-semibold">{{ gudang.name }}</h3>
              <span v-if="gudang.location" class="text-xs text-muted-foreground">— {{ gudang.location }}</span>
            </div>
            <span class="text-xs text-muted-foreground">
              {{ getJumlahItemGudang(gudang.id) }} item
            </span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="border-b bg-muted/30">
                <tr>
                  <th class="h-9 px-4 text-left font-medium text-muted-foreground">Barang</th>
                  <th class="h-9 px-4 text-left font-medium text-muted-foreground">Satuan</th>
                  <th class="h-9 px-4 text-center font-medium text-muted-foreground">Stok</th>
                  <th class="h-9 px-4 text-center font-medium text-muted-foreground">Min Stok</th>
                  <th class="h-9 px-4 text-center font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in getItemPerGudang(gudang.id)"
                  :key="item.itemId"
                  class="border-b transition-colors hover:bg-muted/30"
                >
                  <td class="p-3">
                    <p class="font-medium">{{ item.itemName }}</p>
                    <p class="text-xs text-muted-foreground">{{ item.itemCode }}</p>
                  </td>
                  <td class="p-3 text-muted-foreground">{{ item.unit }}</td>
                  <td class="p-3 text-center">
                    <span :class="getWarnaStokGudang(item.quantity)" class="font-semibold">
                      {{ item.quantity }}
                    </span>
                  </td>
                  <td class="p-3 text-center text-muted-foreground">{{ item.minStock }}</td>
                  <td class="p-3 text-center">
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="getBadgeStatus(item.quantity, item.minStock)"
                    >
                      {{ getLabelStatus(item.quantity, item.minStock) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty per gudang -->
          <div v-if="getItemPerGudang(gudang.id).length === 0" class="text-center py-6 text-sm text-muted-foreground">
            Tidak ada stok di gudang ini.
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

import { WarehouseIcon, SearchIcon, AlertCircleIcon, PackageIcon } from 'lucide-vue-next'
import type { GudangItem } from '#shared/types/IInventory'
import { inventoryService } from '@/services/inventoryService'

// State
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)
const kataPencarian = ref('')
const filterGudang = ref<number | ''>('')
const filterStatus = ref('')
const modeView = ref<'item' | 'gudang'>('item')

// Lookup
const daftarGudang = ref<GudangItem[]>([])

// Raw data dari API
interface BarisStok {
  itemId: number
  itemCode: string
  itemName: string
  unit: string
  minStock: number
  gudangId: number
  gudangName: string
  gudangLocation: string | null
  quantity: number
}
const dataStokMentah = ref<BarisStok[]>([])

// Gudang yang aktif (punya stok atau semua jika tidak filter)
const daftarGudangAktif = computed(() => {
  if (filterGudang.value) {
    return daftarGudang.value.filter(g => g.id === Number(filterGudang.value))
  }
  return daftarGudang.value
})

// Data yang sudah difilter kata pencarian + status
const dataStokFiltered = computed(() => {
  let data = dataStokMentah.value

  if (kataPencarian.value) {
    const kata = kataPencarian.value.toLowerCase()
    data = data.filter(d =>
      d.itemName.toLowerCase().includes(kata) ||
      d.itemCode.toLowerCase().includes(kata)
    )
  }

  return data
})

// Pivot: per barang → stok di setiap gudang
interface BarisPerBarang {
  itemId: number
  itemCode: string
  itemName: string
  unit: string
  minStock: number
  stokPerGudang: Record<number, number>
  totalStok: number
}

const dataPerBarang = computed(() => {
  const grup: Record<number, BarisPerBarang> = {}

  for (const baris of dataStokFiltered.value) {
    if (!grup[baris.itemId]) {
      grup[baris.itemId] = {
        itemId: baris.itemId,
        itemCode: baris.itemCode,
        itemName: baris.itemName,
        unit: baris.unit,
        minStock: baris.minStock,
        stokPerGudang: {},
        totalStok: 0
      }
    }
    const entry = grup[baris.itemId]!
    entry.stokPerGudang[baris.gudangId] = baris.quantity
    entry.totalStok += baris.quantity
  }

  let hasil = Object.values(grup).sort((a, b) => a.itemName.localeCompare(b.itemName))

  if (filterStatus.value === 'aman') {
    hasil = hasil.filter(b => b.totalStok > b.minStock)
  } else if (filterStatus.value === 'restock') {
    hasil = hasil.filter(b => b.totalStok > 0 && b.totalStok <= b.minStock)
  } else if (filterStatus.value === 'kosong') {
    hasil = hasil.filter(b => b.totalStok === 0)
  }

  return hasil
})

// Summary cards
const ringkasan = computed(() => {
  const semuaItem = dataPerBarang.value
  return {
    totalItem: semuaItem.length,
    itemAman: semuaItem.filter(b => b.totalStok > b.minStock).length,
    itemRestock: semuaItem.filter(b => b.totalStok > 0 && b.totalStok <= b.minStock).length,
    itemKosong: semuaItem.filter(b => b.totalStok === 0).length,
  }
})

// Item per gudang untuk view per gudang
function getItemPerGudang(gudangId: number): BarisStok[] {
  return dataStokFiltered.value
    .filter(d => d.gudangId === gudangId)
    .sort((a, b) => a.itemName.localeCompare(b.itemName))
}

function getJumlahItemGudang(gudangId: number): number {
  return getItemPerGudang(gudangId).length
}

// Helper warna dan badge
function getWarnaStokGudang(jumlah: number): string {
  if (jumlah === 0) return 'text-muted-foreground'
  return 'text-foreground'
}

function getBadgeStatus(stok: number, minStok: number): string {
  if (stok === 0) return 'bg-destructive/10 text-destructive'
  if (stok <= minStok) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
  return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
}

function getLabelStatus(stok: number, minStok: number): string {
  if (stok === 0) return 'Kosong'
  if (stok <= minStok) return 'Perlu Restock'
  return 'Aman'
}

// Fetch data stok
const ambilData = async () => {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    const params: Record<string, any> = {}
    if (filterGudang.value) params.gudangId = filterGudang.value

    dataStokMentah.value = await $fetch<BarisStok[]>('/api/stock', { params })
  } catch (err) {
    pesanError.value = 'Gagal memuat data stok.'
    console.error(err)
  } finally {
    sedangMemuat.value = false
  }
}

// Debounce pencarian
let waktuTunggu: number
const onSearch = () => {
  clearTimeout(waktuTunggu)
  waktuTunggu = window.setTimeout(() => ambilData(), 300)
}

onMounted(async () => {
  try {
    daftarGudang.value = await inventoryService.getGudang()
  } catch (err) {
    console.error('Gagal memuat gudang:', err)
  }
  ambilData()
})
</script>