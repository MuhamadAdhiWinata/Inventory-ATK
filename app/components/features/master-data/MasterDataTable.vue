<!-- features/master-data/MasterDataTable.vue -->
<template>
  <div class="space-y-4">
    <!-- Filters -->
    <MasterDataFilters @filter-change="handleFilterChange" />

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
        @click="fetchData"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Data Table -->
    <div v-else>
      <DataTable :columns="tableColumns" :data="filteredItems" :mobile-columns="mobileColumns">
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
      </DataTable>

      <!-- Pagination -->
      <TablePagination
        v-if="totalItems > itemsPerPage"
        :current-page="currentPage"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { AlertCircleIcon, AlertTriangleIcon } from 'lucide-vue-next'
import type { MasterItem } from '#shared/types/IMasterData'
import { masterDataService } from '@/services/masterDataService'
import DataTable from '@/components/DataTable/DataTable.vue'
import TablePagination from '@/components/DataTable/TablePagination.vue'
import MasterDataFilters from './MasterDataFilters.vue'

// State
const items = ref<MasterItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10
const totalItems = ref(0)

// Filters
const activeFilters = ref({
  kategori: 'Semua',
  search: '',
  status: 'Semua'
})

// Table columns
const tableColumns = [
  { key: 'index', label: 'NO', sortable: true, class: 'w-16' },
  { key: 'kodeBarang', label: 'Kode Barang', sortable: true },
  { key: 'namaBarang', label: 'Nama Barang', sortable: true },
  { key: 'kategori', label: 'Kategori', sortable: true },
  { key: 'subKategori', label: 'Sub Kategori' },
  { key: 'satuan', label: 'Satuan' },
  { key: 'currentStock', label: 'Current Stock', sortable: true },
  { key: 'stokMin', label: 'Stok Min' },
  { key: 'status', label: 'Status', sortable: true }
]

// Mobile columns (hanya field penting)
const mobileColumns = [
  { key: 'kodeBarang', label: 'Kode' },
  { key: 'namaBarang', label: 'Nama' },
  { key: 'kategori', label: 'Kategori' },
  { key: 'currentStock', label: 'Stock' },
  { key: 'status', label: 'Status' }
]

// Filter items berdasarkan search dan status
const filteredItems = computed(() => {
  return items.value
    .filter(item => {
      const matchesSearch = 
        !activeFilters.value.search ||
        item.kodeBarang.toLowerCase().includes(activeFilters.value.search.toLowerCase()) ||
        item.namaBarang.toLowerCase().includes(activeFilters.value.search.toLowerCase())
      
      const matchesStatus = 
        activeFilters.value.status === 'Semua' ||
        item.status === activeFilters.value.status
      
      return matchesSearch && matchesStatus
    })
    .map((item, i) => ({
      ...item,
      index: i + 1 + (currentPage.value - 1) * itemsPerPage
    }))
})

// Fetch data
const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await masterDataService.getItems(
      currentPage.value,
      itemsPerPage,
      activeFilters.value.kategori !== 'Semua' ? activeFilters.value.kategori : undefined
    )
    
    if (response.success) {
      items.value = response.data
      totalItems.value = response.total
    }
  } catch (err) {
    error.value = 'Gagal memuat data master. Silakan coba lagi.'
    console.error('Error fetching master data:', err)
  } finally {
    loading.value = false
  }
}

// Handle filter change
const handleFilterChange = (filters: any) => {
  activeFilters.value = filters
  currentPage.value = 1 // Reset ke halaman pertama saat filter berubah
  fetchData()
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

// Initialize
onMounted(() => {
  fetchData()
})
</script>