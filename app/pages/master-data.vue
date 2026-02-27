<template>
  <main class="p-4 md:px-6">
    <!-- Header -->
    <div class="flex justify-between border-b pb-2 mb-2">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Master Data Barang</h1>
        <p class="text-muted-foreground">Kelola data barang inventaris sekolah.</p>
      </div>

      <!-- Quick Actions -->
      <div class="mt-2 flex flex-col sm:flex-row gap-3 justify-end">
        <button
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <DownloadIcon class="mr-2 h-4 w-4" />
          Export Data
        </button>
        <button
          @click="openAdd"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          Tambah Barang
        </button>
      </div>
    </div>

    <!-- Filters -->
    <MasterDataFilters
      :kategori-list="kategoriList"
      @filter-change="handleFilterChange"
    />

    <!-- Main Table Component -->
    <MasterDataTable
      :items="filteredItems"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      @edit="openEdit"
      @delete="openDelete"
      @page-change="handlePageChange"
      @retry="fetchData"
    />

    <!-- Form Modal -->
    <MasterDataForm
      :is-open="modalOpen"
      :item="selectedItem"
      :kategori-list="kategoriList"
      :sub-kategori-list="subKategoriList"
      :satuan-list="satuanList"
      @close="modalOpen = false"
      @submit="handleFormSubmit"
    />

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :is-open="deleteDialogOpen"
      title="Hapus Barang"
      :description="`Apakah Anda yakin ingin menghapus &quot;${itemToDelete?.namaBarang}&quot;? Tindakan ini tidak dapat dibatalkan.`"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  // middleware: 'auth'
})

import { DownloadIcon, PlusIcon } from 'lucide-vue-next'
import type { MasterItem } from '#shared/types/IMasterData'
import { masterDataService, type KategoriItem, type SubKategoriItem, type SatuanItem } from '@/services/masterDataService'
import MasterDataTable from '@/components/features/master-data/MasterDataTable.vue'
import MasterDataFilters from '@/components/features/master-data/MasterDataFilters.vue'
import MasterDataForm from '@/components/features/master-data/MasterDataForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

// Table state
const items = ref<MasterItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 8
const totalItems = ref(0)

// Filter state
const activeFilters = ref({
  kategori: 'Semua',
  search: '',
  status: 'Semua'
})

// Form modal state
const modalOpen = ref(false)
const selectedItem = ref<MasterItem | null>(null)

// Delete dialog state
const deleteDialogOpen = ref(false)
const itemToDelete = ref<MasterItem | null>(null)
const deleting = ref(false)

// Lookup data
const kategoriList = ref<KategoriItem[]>([])
const subKategoriList = ref<SubKategoriItem[]>([])
const satuanList = ref<SatuanItem[]>([])

// Filter items client-side
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

// Fetch items
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

// Load lookup data + fetch items saat mount
onMounted(async () => {
  try {
    const [cats, subCats, units] = await Promise.all([
      masterDataService.getCategories(),
      masterDataService.getSubCategories(),
      masterDataService.getUnits(),
    ])
    kategoriList.value = cats
    subKategoriList.value = subCats
    satuanList.value = units
  } catch (err) {
    console.error('Failed to load lookup data:', err)
  }

  fetchData()
})

function handleFilterChange(filters: any) {
  activeFilters.value = filters
  currentPage.value = 1
  fetchData()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function openAdd() {
  selectedItem.value = null
  modalOpen.value = true
}

function openEdit(item: MasterItem) {
  selectedItem.value = item
  modalOpen.value = true
}

function openDelete(item: MasterItem) {
  itemToDelete.value = item
  deleteDialogOpen.value = true
}

async function handleConfirmDelete() {
  if (!itemToDelete.value) return

  deleting.value = true
  try {
    await $fetch(`/api/items/${itemToDelete.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'Barang berhasil dihapus', variant: 'success' })
    deleteDialogOpen.value = false
    itemToDelete.value = null
    fetchData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  } finally {
    deleting.value = false
  }
}

async function handleFormSubmit(data: Record<string, any>) {
  try {
    if (selectedItem.value) {
      await $fetch(`/api/items/${selectedItem.value.id}`, {
        method: 'PUT',
        body: data
      })
      toast({ title: 'Berhasil', description: 'Barang berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/items', {
        method: 'POST',
        body: data
      })
      toast({ title: 'Berhasil', description: 'Barang berhasil ditambahkan', variant: 'success' })
    }
    modalOpen.value = false
    fetchData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  }
}
</script>