<template>
  <main class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b pb-4 mb-6">
      <div class="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
        <ArrowDownToLineIcon class="h-5 w-5 text-green-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Inventory In</h1>
        <p class="text-muted-foreground text-sm">Kelola transaksi barang masuk.</p>
      </div>
    </div>

    <!-- Table -->
    <InventoryInTable
      :transactions="transactions"
      :loading="loading"
      :error="error"
      :current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      @add="openAdd"
      @edit="openEdit"
      @delete="openDelete"
      @page-change="handlePageChange"
      @retry="fetchData"
      @search="handleSearch"
    />

    <!-- Form Modal -->
    <InventoryInForm
      :is-open="modalOpen"
      :transaction="selectedTransaction"
      :item-list="itemList"
      :gudang-list="gudangList"
      @close="modalOpen = false"
      @submit="handleFormSubmit"
    />

    <!-- Delete Dialog -->
    <ConfirmDialog
      :is-open="deleteDialogOpen"
      title="Hapus Transaksi"
      :description="`Hapus transaksi ${transactionToDelete?.transactionCode}? Stok barang akan dikembalikan.`"
      :loading="deleting"
      @confirm="handleConfirmDelete"
      @cancel="deleteDialogOpen = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

import { ArrowDownToLineIcon } from 'lucide-vue-next'
import type { InventoryTransaction, GudangItem } from '#shared/types/IInventory'
import { inventoryService } from '@/services/inventoryService'
import InventoryInTable from '@/components/features/inventory-in/InventoryInTable.vue'
import InventoryInForm from '@/components/features/inventory-in/InventoryInForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

// Table state
const transactions = ref<InventoryTransaction[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 8
const totalItems = ref(0)
const searchQuery = ref('')

// Modal state
const modalOpen = ref(false)
const selectedTransaction = ref<InventoryTransaction | null>(null)

// Delete state
const deleteDialogOpen = ref(false)
const transactionToDelete = ref<InventoryTransaction | null>(null)
const deleting = ref(false)

// Lookup data
const itemList = ref<{ id: number; code: string; name: string }[]>([])
const gudangList = ref<GudangItem[]>([])

// Fetch transactions
const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await inventoryService.getTransactions(
      'IN',
      currentPage.value,
      itemsPerPage,
      searchQuery.value || undefined
    )
    transactions.value = response.data
    totalItems.value = response.total
  } catch (err) {
    error.value = 'Gagal memuat data transaksi.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Load lookup data
onMounted(async () => {
  try {
    const [items, gudang] = await Promise.all([
      $fetch<{ id: number; code: string; name: string }[]>('/api/items-simple'),
      inventoryService.getGudang()
    ])
    itemList.value = items
    gudangList.value = gudang
  } catch (err) {
    console.error('Failed to load lookup data:', err)
  }
  fetchData()
})

function handleSearch(query: string) {
  searchQuery.value = query
  currentPage.value = 1
  fetchData()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function openAdd() {
  selectedTransaction.value = null
  modalOpen.value = true
}

function openEdit(tx: InventoryTransaction) {
  selectedTransaction.value = tx
  modalOpen.value = true
}

function openDelete(tx: InventoryTransaction) {
  transactionToDelete.value = tx
  deleteDialogOpen.value = true
}

async function handleFormSubmit(data: Record<string, any>) {
  try {
    if (selectedTransaction.value) {
      await $fetch(`/api/transactions/${selectedTransaction.value.id}`, {
        method: 'PUT',
        body: { ...data, type: 'IN' }
      })
      toast({ title: 'Berhasil', description: 'Transaksi berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: { ...data, type: 'IN' }
      })
      toast({ title: 'Berhasil', description: 'Transaksi berhasil ditambahkan', variant: 'success' })
    }
    modalOpen.value = false
    fetchData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  }
}

async function handleConfirmDelete() {
  if (!transactionToDelete.value) return
  deleting.value = true
  try {
    await $fetch(`/api/transactions/${transactionToDelete.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'Transaksi berhasil dihapus', variant: 'success' })
    deleteDialogOpen.value = false
    transactionToDelete.value = null
    fetchData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  } finally {
    deleting.value = false
  }
}
</script>