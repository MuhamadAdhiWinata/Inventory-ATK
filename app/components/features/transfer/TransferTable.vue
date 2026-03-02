<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          v-model="pencarianQuery"
          @input="onSearch"
          placeholder="Cari kode transaksi atau nama barang..."
          class="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      <button
        @click="emit('add')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-orange-500 text-white hover:bg-orange-600 h-10 px-4 py-2"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Transfer Barang
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data transfer...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <div class="flex items-center gap-2 text-destructive mb-2">
        <AlertCircleIcon class="h-5 w-5" />
        <h3 class="font-semibold">Terjadi Kesalahan</h3>
      </div>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <button @click="emit('retry')" class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
        Coba Lagi
      </button>
    </div>

    <div v-else>
      <!-- Desktop -->
      <div class="hidden md:block overflow-x-auto border rounded-lg">
        <table class="w-full caption-bottom text-sm">
          <thead class="border-b bg-muted/50">
            <tr>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Kode Transaksi</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Tanggal</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Barang</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Quantity</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Dari Gudang</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Ke Gudang</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Description</th>
              <th class="h-11 px-4 text-left font-medium text-muted-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaksi in transactions" :key="transaksi.id" class="border-b transition-colors hover:bg-muted/50">
              <td class="p-4 font-medium text-orange-500">{{ transaksi.transactionCode }}</td>
              <td class="p-4">{{ formatTanggal(transaksi.date) }}</td>
              <td class="p-4">{{ transaksi.itemName }}</td>
              <td class="p-4">
                <span class="font-semibold">{{ transaksi.quantity }}</span>
                <span class="text-muted-foreground text-xs ml-1">{{ transaksi.unit }}</span>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1">
                  <WarehouseIcon class="h-3.5 w-3.5 text-muted-foreground" />
                  {{ transaksi.gudangName ?? '-' }}
                </span>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1">
                  <ArrowRightIcon class="h-3.5 w-3.5 text-orange-500" />
                  {{ transaksi.gudangTujuanName ?? '-' }}
                </span>
              </td>
              <td class="p-4 max-w-[160px] truncate text-muted-foreground">{{ transaksi.description ?? '-' }}</td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button
                    @click="emit('edit', transaksi)"
                    class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent transition-colors"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="emit('delete', transaksi)"
                    class="h-8 w-8 inline-flex items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2Icon class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile -->
      <div class="md:hidden space-y-3">
        <div v-for="transaksi in transactions" :key="transaksi.id" class="border rounded-lg p-4 bg-card">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-semibold text-orange-500">{{ transaksi.transactionCode }}</p>
              <p class="text-xs text-muted-foreground">{{ formatTanggal(transaksi.date) }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="emit('edit', transaksi)" class="h-7 w-7 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center">
                <PencilIcon class="h-3.5 w-3.5" />
              </button>
              <button @click="emit('delete', transaksi)" class="h-7 w-7 rounded-md border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center">
                <Trash2Icon class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p class="text-muted-foreground">Barang</p>
              <p class="font-medium">{{ transaksi.itemName }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Quantity</p>
              <p class="font-medium">{{ transaksi.quantity }} {{ transaksi.unit }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Dari Gudang</p>
              <p class="font-medium">{{ transaksi.gudangName ?? '-' }}</p>
            </div>
            <div>
              <p class="text-muted-foreground">Ke Gudang</p>
              <p class="font-medium">{{ transaksi.gudangTujuanName ?? '-' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-muted-foreground">Description</p>
              <p>{{ transaksi.description ?? '-' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!loading && transactions.length === 0" class="text-center py-12 border rounded-lg">
        <div class="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <ArrowRightLeftIcon class="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 class="font-semibold mb-1">Belum Ada Transfer</h3>
        <p class="text-sm text-muted-foreground">Belum ada transfer barang antar gudang.</p>
      </div>

      <TablePagination
        v-if="totalItems > itemsPerPage"
        :current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        @page-change="emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchIcon, PlusIcon, AlertCircleIcon, PencilIcon, Trash2Icon, ArrowRightIcon, ArrowRightLeftIcon, WarehouseIcon } from 'lucide-vue-next'
import type { InventoryTransaction } from '#shared/types/IInventory'
import TablePagination from '@/components/DataTable/TablePagination.vue'

interface Props {
  transactions: InventoryTransaction[]
  loading: boolean
  error: string | null
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

defineProps<Props>()

const emit = defineEmits<{
  add: []
  edit: [transaksi: InventoryTransaction]
  delete: [transaksi: InventoryTransaction]
  'page-change': [page: number]
  retry: []
  search: [query: string]
}>()

const pencarianQuery = ref('')

let waktuTungguCari: number
const onSearch = () => {
  clearTimeout(waktuTungguCari)
  waktuTungguCari = window.setTimeout(() => {
    emit('search', pencarianQuery.value)
  }, 300)
}

const formatTanggal = (tanggal: string) => {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
</script>