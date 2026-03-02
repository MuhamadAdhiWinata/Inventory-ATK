<template>
  <main class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 border-b pb-4 mb-6">
      <div class="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
        <ArrowRightLeftIcon class="h-5 w-5 text-orange-500" />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Transfer Gudang</h1>
        <p class="text-muted-foreground text-sm">Pindahkan barang antar gudang.</p>
      </div>
    </div>

    <!-- Table -->
    <TransferTable
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
    <TransferForm
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
      title="Hapus Transfer"
      :description="`Hapus transfer ${transaksiAkanDihapus?.transactionCode}? Data stok akan berubah.`"
      :loading="sedangMenghapus"
      @confirm="handleKonfirmasiHapus"
      @cancel="dialogHapusTerbuka = false"
    />
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

import { ArrowRightLeftIcon } from 'lucide-vue-next'
import type { InventoryTransaction, GudangItem } from '#shared/types/IInventory'
import { inventoryService } from '@/services/inventoryService'
import TransferTable from '@/components/features/transfer/TransferTable.vue'
import TransferForm from '@/components/features/transfer/TransferForm.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

const daftarTransaksi = ref<InventoryTransaction[]>([])
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)
const halamanSaat = ref(1)
const transaksiPerHalaman = 10
const totalTransaksi = ref(0)
const kataPencarian = ref('')

const formTerbuka = ref(false)
const transaksiDipilih = ref<InventoryTransaction | null>(null)

const dialogHapusTerbuka = ref(false)
const transaksiAkanDihapus = ref<InventoryTransaction | null>(null)
const sedangMenghapus = ref(false)

const daftarBarang = ref<{ id: number; code: string; name: string; unit: string }[]>([])
const daftarGudang = ref<GudangItem[]>([])

const ambilData = async () => {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    const response = await inventoryService.getTransactions(
      'TRANSFER',
      halamanSaat.value,
      transaksiPerHalaman,
      kataPencarian.value || undefined
    )
    daftarTransaksi.value = response.data
    totalTransaksi.value = response.total
  } catch (err) {
    pesanError.value = 'Gagal memuat data transfer.'
    console.error(err)
  } finally {
    sedangMemuat.value = false
  }
}

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
        body: { ...data, type: 'TRANSFER' }
      })
      toast({ title: 'Berhasil', description: 'Transfer berhasil diperbarui', variant: 'success' })
    } else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: { ...data, type: 'TRANSFER' }
      })
      toast({ title: 'Berhasil', description: 'Transfer berhasil dicatat', variant: 'success' })
    }
    formTerbuka.value = false
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  }
}

async function handleKonfirmasiHapus() {
  if (!transaksiAkanDihapus.value) return
  sedangMenghapus.value = true
  try {
    await $fetch(`/api/transactions/${transaksiAkanDihapus.value.id}`, { method: 'DELETE' })
    toast({ title: 'Berhasil', description: 'Transfer berhasil dihapus', variant: 'success' })
    dialogHapusTerbuka.value = false
    transaksiAkanDihapus.value = null
    ambilData()
  } catch (err: any) {
    toast({ title: 'Gagal', description: err.data?.message ?? err.message, variant: 'destructive' })
  } finally {
    sedangMenghapus.value = false
  }
}
</script>