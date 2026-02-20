<!-- pages/MasterData.vue - FIXED -->
<template>
  <main class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex justify-between border-b pb-2 mb-2">
      <div class="">
        <h1 class="text-2xl font-bold tracking-tight">Master Data Barang</h1>
        <p class="text-muted-foreground">
          Kelola data barang inventaris sekolah.
        </p>
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
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          Tambah Barang
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <!-- <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Total Barang</p>
            <p class="text-2xl font-bold">{{ totalItems }}</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <PackageIcon class="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Perlu Restock</p>
            <p class="text-2xl font-bold text-destructive">{{ needRestockCount }}</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangleIcon class="h-6 w-6 text-destructive" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Kategori</p>
            <p class="text-2xl font-bold">4</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <TagIcon class="h-6 w-6 text-secondary" />
          </div>
        </div>
      </div>

      <div class="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Stock Aman</p>
            <p class="text-2xl font-bold text-green-600">{{ safeStockCount }}</p>
          </div>
          <div class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div> -->

    <!-- Main Table Component -->
    <MasterDataTable /> <!-- REMOVED: ref attribute -->

  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
//   middleware: 'auth'
})
import { ref, computed } from 'vue' // REMOVED: masterDataTable ref
import { 
  PackageIcon, 
  AlertTriangleIcon, 
  TagIcon, 
  CheckCircleIcon,
  DownloadIcon,
  PlusIcon
} from 'lucide-vue-next'
import { masterDataService } from '@/services/masterDataService'
import MasterDataTable from '@/components/features/master-data/MasterDataTable.vue'

const totalItems = ref(15)

// Stats calculation
const needRestockCount = computed(() => {
  return 7
})

const safeStockCount = computed(() => {
  return totalItems.value - needRestockCount.value
})

// Load initial stats
// const loadStats = async () => {
//   try {
//     const response = await masterDataService.getItems(1, 1)
//     totalItems.value = response.total
//   } catch (error) {
//     console.error('Failed to load stats:', error)
//   }
// }

// loadStats()
</script>