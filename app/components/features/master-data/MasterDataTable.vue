<template>
  <div class="space-y-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p class="mt-4 text-sm text-muted-foreground">Memuat data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <div class="flex items-center gap-2 text-destructive mb-2">
        <AlertCircleIcon class="h-5 w-5" />
        <h3 class="font-semibold text-lg">Terjadi Kesalahan</h3>
      </div>
      <p class="text-sm text-muted-foreground mb-4">{{ error }}</p>
      <button
        @click="emit('retry')"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Data Table -->
    <div v-else>
      <DataTable :columns="tableColumns" :data="items" :mobile-columns="mobileColumns">
        <template #cell-index="{ value }">
          {{ value }}
        </template>
        <template #cell-currentStock="{ row, value }">
          <div class="flex items-center gap-2">
            <span :class="{ 'text-destructive font-semibold': row.status === 'Perlu Restock' }">
              {{ value }} {{ row.satuan }}
            </span>
            <AlertTriangleIcon
              v-if="row.status === 'Perlu Restock'"
              class="h-4 w-4 text-destructive"
            />
          </div>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <Button
              @click="emit('edit', row)"
              class="rounded-md text-sm h-8 w-8 transition-colors"
            >
              <PencilIcon class="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              @click="emit('delete', row)"
              class="rounded-md text-sm h-8 w-8 transition-colors"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </template>
      </DataTable>

      <!-- Pagination -->
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
import { AlertCircleIcon, AlertTriangleIcon, PencilIcon, Trash2 } from 'lucide-vue-next'
import type { MasterItem } from '#shared/types/IMasterData'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/DataTable/DataTable.vue'
import TablePagination from '@/components/DataTable/TablePagination.vue'

interface Props {
  items: (MasterItem & { index: number })[]
  loading: boolean
  error: string | null
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

defineProps<Props>()

const emit = defineEmits<{
  edit: [item: MasterItem]
  delete: [item: MasterItem]
  'page-change': [page: number]
  retry: []
}>()

const tableColumns = [
  { key: 'index', label: 'NO', class: 'w-16' },
  { key: 'kodeBarang', label: 'Kode Barang', sortable: true },
  { key: 'namaBarang', label: 'Nama Barang', sortable: true },
  { key: 'kategori', label: 'Kategori', sortable: true },
  { key: 'subKategori', label: 'Sub Kategori' },
  { key: 'satuan', label: 'Satuan' },
  // { key: 'currentStock', label: 'Current Stock', sortable: true },
  { key: 'stokMin', label: 'Stok Min' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'actions', label: 'Aksi', class: 'w-24' }
]

const mobileColumns = [
  { key: 'kodeBarang', label: 'Kode' },
  { key: 'namaBarang', label: 'Nama' },
  { key: 'kategori', label: 'Kategori' },
  { key: 'currentStock', label: 'Stock' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi' }
]
</script>