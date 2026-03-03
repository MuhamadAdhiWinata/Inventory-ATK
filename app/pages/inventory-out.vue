<template>
  <main class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b pb-4 mb-6">
      <div class="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
        <ArrowUpFromLineIcon class="h-5 w-5 text-red-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Inventory Out</h1>
        <p class="text-muted-foreground text-sm">Kelola transaksi barang keluar.</p>
      </div>
    </div>

    <!-- Table -->
    <InventoryOutTable
      :transactions="daftarTransaksi"
      :loading="sedangMemuat"
      :error="pesanError"
      :current-page="halamanSaat"
      :total-items="totalTransaksi"
      :items-per-page="transaksiPerHalaman"
      @add="bukaFormTambah"
      @edit="bukaFormEdit"
      @delete="bukaDialogHapus"
      @page-change="gantiHalaman"
      @retry="ambilData"
      @search="cariTransaksi"
    />

    <!-- Form Modal -->
    <InventoryOutForm
      :is-open="formTerbuka"
      :transaction="transaksiDipilih"
      :item-list="daftarBarang"
      :gudang-list="daftarGudang"
      @close="formTerbuka = false"
      @submit="handleSubmitForm"
    />

    <!-- Delete Dialog -->
    <ConfirmDialog
      :is-open="dialogHapusTerbuka"
      title="Hapus Transaksi"
      :description="`Hapus transaksi ${transaksiAkanDihapus?.transactionCode}? Stok barang akan dikembalikan.`"
      :loading="sedangMenghapus"
      @confirm="handleKonfirmasiHapus"
      @cancel="dialogHapusTerbuka = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'default',
    middleware: ['auth']
})

import { ArrowUpFromLineIcon } from 'lucide-vue-next'
import type { InventoryTransaction, GudangItem } from '#shared/types/IInventory'
import { inventoryService } from '@/services/inventoryService'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/hooks/use-toast'
import InventoryOutTable from '~/components/features/Inventory-out/InventoryOutTable.vue'
import InventoryOutForm from '~/components/features/Inventory-out/InventoryOutForm.vue'

const { toast } = useToast()

// State tabel
const daftarTransaksi = ref<InventoryTransaction[]>([])
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)
const halamanSaat = ref(1)
const transaksiPerHalaman = 8
const totalTransaksi = ref(0)
const kataPencarian = ref('')

// State form modal
const formTerbuka = ref(false)
const transaksiDipilih = ref<InventoryTransaction | null>(null)

// State dialog hapus
const dialogHapusTerbuka = ref(false)
const transaksiAkanDihapus = ref<InventoryTransaction | null>(null)
const sedangMenghapus = ref(false)

// Lookup data
const daftarBarang = ref<{ id: number; code: string; name: string; unit: string }[]>([])
const daftarGudang = ref<GudangItem[]>([])

// Ambil data transaksi OUT
const ambilData = async () => {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    const response = await inventoryService.getTransactions(
      'OUT',
      halamanSaat.value,
      transaksiPerHalaman,
      kataPencarian.value || undefined
    )
    daftarTransaksi.value = response.data
    totalTransaksi.value = response.total
  } catch (err) {
    pesanError.value = 'Gagal memuat data transaksi.'
    console.error(err)
  } finally {
    sedangMemuat.value = false
  }
}

// Load lookup data saat mount
onMounted(async () => {
  try {
    const [barang, gudang] = await Promise.all([
      $fetch<{ id: number; code: string; name: string; unit: string }[]>('/api/items-simple'),
      inventoryService.getGudang()
    ])
    daftarBarang.value = barang
    daftarGudang.value = gudang
  } catch (err) {
    console.error('Gagal memuat data lookup:', err)
  }
  ambilData()
})

function cariTransaksi(query: string) {
  kataPencarian.value = query
  halamanSaat.value = 1
  ambilData()
}

function gantiHalaman(halaman: number) {
  halamanSaat.value = halaman
  ambilData()
}

function bukaFormTambah() {
  transaksiDipilih.value = null
  formTerbuka.value = true
}

function bukaFormEdit(transaksi: InventoryTransaction) {
  transaksiDipilih.value = transaksi
  formTerbuka.value = true
}

function bukaDialogHapus(transaksi: InventoryTransaction) {
  transaksiAkanDihapus.value = transaksi
  dialogHapusTerbuka.value = true
}

async function handleSubmitForm(data: Record<string, any>) {
  try {
    if (transaksiDipilih.value) {
      await $fetch(`/api/transactions/${transaksiDipilih.value.id}`, {
        method: 'PUT',
        body: { ...data, type: 'OUT' }
      })
      toast({ title: 'Berhasil', description: 'Transaksi berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: { ...data, type: 'OUT' }
      })
      toast({ title: 'Berhasil', description: 'Transaksi berhasil ditambahkan', variant: 'success' })
    }
    formTerbuka.value = false
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  }
}

async function handleKonfirmasiHapus() {
  if (!transaksiAkanDihapus.value) return
  sedangMenghapus.value = true
  try {
    await $fetch(`/api/transactions/${transaksiAkanDihapus.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'Transaksi berhasil dihapus', variant: 'success' })
    dialogHapusTerbuka.value = false
    transaksiAkanDihapus.value = null
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.message, variant: 'destructive' })
  } finally {
    sedangMenghapus.value = false
  }
}
</script>