<!-- pages/MasterData.vue - FIXED -->
<template>
  <main class="p-4 md:px-6">
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
          @click="openAdd"
          class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <PlusIcon class="mr-2 h-4 w-4" />
          Tambah Barang
        </button>
      </div>
    </div>

    <!-- Main Table Component -->
    <MasterDataTable @edit="openEdit" @delete="openDelete" />

    <MasterDataForm
      :is-open="modalOpen"
      :item="selectedItem"
      :kategori-list="kategoriList"
      :sub-kategori-list="subKategoriList"
      :satuan-list="satuanList"
      @close="modalOpen = false"
      @submit="handleFormSubmit"
    />

  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
//   middleware: 'auth'
})
import { ref, computed } from 'vue' // REMOVED: masterDataTable ref
import { 
  DownloadIcon,
  PlusIcon
} from 'lucide-vue-next'
import MasterDataTable from '@/components/features/master-data/MasterDataTable.vue'
import MasterDataForm from '~/components/features/master-data/MasterDataForm.vue'

const totalItems = ref(15)
const modalOpen = ref(false)
const selectedItem = ref<MasterItem | null>(null)
const kategoriList = ref([])
const subKategoriList = ref([])
const satuanList = ref([])

function openAdd() {
  selectedItem.value = null
  modalOpen.value = true
}

function openEdit(item: MasterItem) {
  selectedItem.value = item
  modalOpen.value = true
}

function openDelete(item: MasterItem) {
  if (confirm(`Apakah Anda yakin ingin menghapus "${item.namaBarang}"?`)) {
    console.log('Delete item:', item)
  }
}

async function handleFormSubmit(data: Record<string, any>) {
  console.log('submit', data)
  modalOpen.value = false
}

// Stats calculation
const needRestockCount = computed(() => {
  return 7
})

const safeStockCount = computed(() => {
  return totalItems.value - needRestockCount.value
})

</script>