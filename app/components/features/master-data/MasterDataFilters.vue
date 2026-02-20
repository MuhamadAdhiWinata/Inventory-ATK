<!-- features/master-data/MasterDataFilters.vue - FIXED -->
<template>
  <div class="flex flex-col md:flex-row gap-4 mb-6">
    <!-- Category Filter -->
    <div class="w-full md:w-auto">
      <label class="block text-sm font-medium mb-2 text-muted-foreground">Filter Kategori</label>
      <select
        v-model="selectedCategory"
        @change="emitFilters"
        class="w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Search -->
    <div class="w-full md:w-auto flex-1">
      <label class="block text-sm font-medium mb-2 text-muted-foreground">Cari Barang</label>
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="Cari berdasarkan kode atau nama..."
          class="w-full pl-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    </div>

    <!-- Stock Status Filter -->
    <div class="w-full md:w-auto">
      <label class="block text-sm font-medium mb-2 text-muted-foreground">Status Stock</label>
      <select
        v-model="selectedStatus"
        @change="emitFilters"
        class="w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="Semua">Semua Status</option>
        <option value="Aman">Stock Aman</option>
        <option value="Perlu Restock">Perlu Restock</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue' // REMOVED: watch import tidak digunakan
import { SearchIcon } from 'lucide-vue-next'
import { masterDataService } from '@/services/masterDataService'

interface Filters {
  kategori: string
  search: string
  status: string
}

const categories = ref<string[]>(['Semua'])
const selectedCategory = ref('Semua')
const searchQuery = ref('')
const selectedStatus = ref('Semua')

const emit = defineEmits<{
  'filter-change': [filters: Filters]
}>()

// Load categories
const loadCategories = async () => {
  try {
    const cats = await masterDataService.getCategories()
    categories.value = cats
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

// Debounced search
let searchTimeout: number // CHANGED: dari NodeJS.Timeout ke number
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => { // CHANGED: gunakan window.setTimeout
    emitFilters()
  }, 300)
}

const emitFilters = () => {
  emit('filter-change', {
    kategori: selectedCategory.value,
    search: searchQuery.value,
    status: selectedStatus.value
  })
}

// Initialize
loadCategories()
</script>