<template>
  <main class="p-4 md:p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground text-sm mt-0.5">
          Selamat datang, <span class="font-medium text-foreground">{{ authStore.user?.name }}</span>.
          {{ tanggalHariIni }}
        </p>
      </div>
      <button @click="ambilData" :disabled="sedangMemuat"
        class="inline-flex items-center gap-2 rounded-md text-sm border border-input bg-background hover:bg-accent h-9 px-3 transition-colors disabled:opacity-50">
        <RefreshCwIcon class="h-4 w-4" :class="{ 'animate-spin': sedangMemuat }" />
        <span class="hidden sm:inline">Refresh</span>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="sedangMemuat" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div v-for="i in 6" :key="i" class="h-28 rounded-xl bg-muted animate-pulse" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div class="lg:col-span-2 h-64 rounded-xl bg-muted animate-pulse" />
        <div class="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>

    <template v-else-if="data">
      <!-- ===== STAT CARDS ===== -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

        <!-- Total Barang -->
        <div class="col-span-1 rounded-xl border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Total Barang</span>
            <div class="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BoxesIcon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ data.ringkasan.totalBarang }}</p>
            <p class="text-xs text-muted-foreground">jenis barang</p>
          </div>
        </div>

        <!-- Total Gudang -->
        <div class="col-span-1 rounded-xl border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Gudang</span>
            <div class="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <WarehouseIcon class="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ data.ringkasan.totalGudang }}</p>
            <p class="text-xs text-muted-foreground">lokasi aktif</p>
          </div>
        </div>

        <!-- Total Stok -->
        <div class="col-span-1 rounded-xl border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Total Stok</span>
            <div class="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <PackageIcon class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold">{{ formatAngka(data.ringkasan.stokTotal) }}</p>
            <p class="text-xs text-muted-foreground">unit tersedia</p>
          </div>
        </div>

        <!-- Masuk Bulan Ini -->
        <div class="col-span-1 rounded-xl border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Masuk Bulan Ini</span>
            <div class="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowDownToLineIcon class="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ formatAngka(data.bulanIni.masuk) }}</p>
            <div class="flex items-center gap-1">
              <component :is="trendMasuk >= 0 ? TrendingUpIcon : TrendingDownIcon"
                class="h-3 w-3" :class="trendMasuk >= 0 ? 'text-green-500' : 'text-red-500'" />
              <p class="text-xs" :class="trendMasuk >= 0 ? 'text-green-600' : 'text-red-500'">
                {{ trendMasuk >= 0 ? '+' : '' }}{{ trendMasuk }}% vs bulan lalu
              </p>
            </div>
          </div>
        </div>

        <!-- Keluar Bulan Ini -->
        <div class="col-span-1 rounded-xl border bg-card p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Keluar Bulan Ini</span>
            <div class="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ArrowUpFromLineIcon class="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ formatAngka(data.bulanIni.keluar) }}</p>
            <div class="flex items-center gap-1">
              <component :is="trendKeluar >= 0 ? TrendingUpIcon : TrendingDownIcon"
                class="h-3 w-3" :class="trendKeluar >= 0 ? 'text-red-500' : 'text-green-500'" />
              <p class="text-xs" :class="trendKeluar >= 0 ? 'text-red-500' : 'text-green-600'">
                {{ trendKeluar >= 0 ? '+' : '' }}{{ trendKeluar }}% vs bulan lalu
              </p>
            </div>
          </div>
        </div>

        <!-- Alert -->
        <div class="col-span-1 rounded-xl border p-4 space-y-3"
          :class="data.ringkasan.stokKosong > 0
            ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
            : data.ringkasan.perluRestock > 0
              ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
              : 'bg-card'">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Perlu Perhatian</span>
            <div class="h-8 w-8 rounded-lg flex items-center justify-center"
              :class="data.ringkasan.stokKosong > 0
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'">
              <AlertTriangleIcon class="h-4 w-4"
                :class="data.ringkasan.stokKosong > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'" />
            </div>
          </div>
          <div>
            <p class="text-2xl font-bold"
              :class="data.ringkasan.stokKosong > 0 ? 'text-red-600' : 'text-amber-600'">
              {{ data.ringkasan.stokKosong + data.ringkasan.perluRestock }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ data.ringkasan.stokKosong }} kosong · {{ data.ringkasan.perluRestock }} hampir habis
            </p>
          </div>
        </div>
      </div>

      <!-- ===== GRAFIK + AKTIVITAS ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- Grafik 30 hari -->
        <div class="lg:col-span-2 rounded-xl border bg-card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold">Aktivitas Transaksi</h3>
              <p class="text-xs text-muted-foreground">30 hari terakhir</p>
            </div>
            <div class="flex items-center gap-4 text-xs text-muted-foreground">
              <span class="flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block"></span> Masuk
              </span>
              <span class="flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-sm bg-red-400 inline-block"></span> Keluar
              </span>
            </div>
          </div>
          <!-- Simple bar chart dengan CSS -->
          <div v-if="data.transaksi30Hari.length > 0" class="flex items-end gap-0.5 h-40 w-full">
            <div v-for="(hari, i) in chartData" :key="i"
              class="flex-1 flex flex-col items-center gap-0.5 group relative">
              <!-- Tooltip -->
              <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div class="bg-popover border rounded-md shadow-md px-2.5 py-1.5 text-xs whitespace-nowrap">
                  <p class="font-medium text-center">{{ hari.label }}</p>
                  <p class="text-emerald-600">Masuk: {{ hari.masuk }}</p>
                  <p class="text-red-500">Keluar: {{ hari.keluar }}</p>
                </div>
                <div class="h-1.5 w-1.5 bg-popover border-b border-r rotate-45 -mt-1"></div>
              </div>
              <!-- Bars -->
              <div class="w-full flex gap-0.5 items-end" style="height: 100%">
                <div class="flex-1 rounded-t-sm bg-emerald-500/80 hover:bg-emerald-500 transition-colors min-h-[2px]"
                  :style="{ height: `${hari.masukPct}%` }" />
                <div class="flex-1 rounded-t-sm bg-red-400/80 hover:bg-red-400 transition-colors min-h-[2px]"
                  :style="{ height: `${hari.keluarPct}%` }" />
              </div>
            </div>
          </div>
          <div v-else class="h-40 flex items-center justify-center text-sm text-muted-foreground">
            Belum ada data transaksi 30 hari terakhir
          </div>
        </div>

        <!-- Barang hampir habis -->
        <div class="rounded-xl border bg-card p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-semibold">Stok Rendah</h3>
              <p class="text-xs text-muted-foreground">Barang perlu diperhatikan</p>
            </div>
            <NuxtLink to="/stock"
              class="text-xs text-primary hover:underline flex items-center gap-1">
              Lihat semua <ArrowRightIcon class="h-3 w-3" />
            </NuxtLink>
          </div>
          <div class="space-y-3">
            <div v-for="barang in data.barangHampirHabis" :key="barang.id"
              class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                :class="barang.stok === 0
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : barang.stok <= barang.minStok
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-muted'">
                <PackageIcon class="h-4 w-4"
                  :class="barang.stok === 0
                    ? 'text-red-600'
                    : barang.stok <= barang.minStok
                      ? 'text-amber-600'
                      : 'text-muted-foreground'" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ barang.name }}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <!-- Progress bar -->
                  <div class="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                      :class="barang.stok === 0
                        ? 'bg-red-500'
                        : barang.stok <= barang.minStok
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'"
                      :style="{ width: `${Math.min(100, barang.minStok > 0 ? (barang.stok / (barang.minStok * 2)) * 100 : 100)}%` }" />
                  </div>
                  <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {{ barang.stok }} / {{ barang.minStok }} {{ barang.satuan }}
                  </span>
                </div>
              </div>
              <span class="text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0"
                :class="barang.stok === 0
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : barang.stok <= barang.minStok
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-700'">
                {{ barang.stok === 0 ? 'Kosong' : barang.stok <= barang.minStok ? 'Rendah' : 'Aman' }}
              </span>
            </div>
            <p v-if="data.barangHampirHabis.length === 0" class="text-sm text-muted-foreground text-center py-4">
              Semua stok dalam kondisi aman 🎉
            </p>
          </div>
        </div>
      </div>

      <!-- ===== TRANSAKSI TERBARU ===== -->
      <div class="rounded-xl border bg-card">
        <div class="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 class="font-semibold">Transaksi Terbaru</h3>
            <p class="text-xs text-muted-foreground">8 transaksi terakhir</p>
          </div>
          <NuxtLink to="/inventory-in"
            class="text-xs text-primary hover:underline flex items-center gap-1">
            Lihat semua <ArrowRightIcon class="h-3 w-3" />
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b bg-muted/30">
              <tr>
                <th class="h-10 px-5 text-left text-xs font-medium text-muted-foreground">Kode</th>
                <th class="h-10 px-3 text-left text-xs font-medium text-muted-foreground">Barang</th>
                <th class="h-10 px-3 text-left text-xs font-medium text-muted-foreground">Tipe</th>
                <th class="h-10 px-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
                <th class="h-10 px-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Gudang</th>
                <th class="h-10 px-5 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in data.transaksiTerbaru" :key="t.id"
                class="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td class="px-5 py-3">
                  <span class="font-mono text-xs text-muted-foreground">{{ t.kode }}</span>
                </td>
                <td class="px-3 py-3">
                  <p class="font-medium text-sm">{{ t.namaBarang }}</p>
                  <p class="text-xs text-muted-foreground">{{ t.kodeBarang }}</p>
                </td>
                <td class="px-3 py-3">
                  <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400': t.tipe === 'IN',
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': t.tipe === 'OUT',
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': t.tipe === 'TRANSFER',
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400': t.tipe === 'ADJUSTMENT',
                    }">
                    <component :is="ikonTipe(t.tipe)" class="h-3 w-3" />
                    {{ labelTipe(t.tipe) }}
                  </span>
                </td>
                <td class="px-3 py-3 text-right font-medium tabular-nums">
                  <span :class="{
                    'text-emerald-600': t.tipe === 'IN',
                    'text-red-600': t.tipe === 'OUT',
                    'text-blue-600': t.tipe === 'TRANSFER',
                  }">
                    {{ t.tipe === 'OUT' ? '-' : '+' }}{{ t.quantity }} {{ t.unitName }}
                  </span>
                </td>
                <td class="px-3 py-3 hidden md:table-cell text-muted-foreground text-xs">
                  {{ t.namaGudang ?? '-' }}
                </td>
                <td class="px-5 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                  {{ formatTanggal(t.date) }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="data.transaksiTerbaru.length === 0"
            class="text-center py-12 text-sm text-muted-foreground">
            Belum ada transaksi.
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <div v-else-if="pesanError" class="rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center">
      <AlertTriangleIcon class="h-8 w-8 text-destructive mx-auto mb-3" />
      <p class="text-destructive font-semibold mb-1">Gagal Memuat Dashboard</p>
      <p class="text-sm text-muted-foreground mb-4">{{ pesanError }}</p>
      <button @click="ambilData" class="rounded-md text-sm bg-primary text-primary-foreground h-9 px-4">Coba Lagi</button>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: ['auth'] })

import {
  BoxesIcon, WarehouseIcon, PackageIcon,
  ArrowDownToLineIcon, ArrowUpFromLineIcon, ArrowRightLeftIcon,
  AlertTriangleIcon, TrendingUpIcon, TrendingDownIcon,
  RefreshCwIcon, ArrowRightIcon, SlidersHorizontalIcon
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

interface DashboardData {
  ringkasan: {
    totalBarang: number
    totalGudang: number
    totalKategori: number
    stokTotal: number
    perluRestock: number
    stokKosong: number
  }
  bulanIni: { masuk: number; keluar: number; transfer: number }
  bulanLalu: { masuk: number; keluar: number }
  transaksi30Hari: { tanggal: string; masuk: number; keluar: number }[]
  transaksiTerbaru: any[]
  barangHampirHabis: any[]
}

const data = ref<DashboardData | null>(null)
const sedangMemuat = ref(false)
const pesanError = ref<string | null>(null)

const tanggalHariIni = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
})

// Trend bulan ini vs bulan lalu
const trendMasuk = computed(() => {
  if (!data.value) return 0
  const lalu = data.value.bulanLalu.masuk
  const ini = data.value.bulanIni.masuk
  if (lalu === 0) return ini > 0 ? 100 : 0
  return Math.round(((ini - lalu) / lalu) * 100)
})

const trendKeluar = computed(() => {
  if (!data.value) return 0
  const lalu = data.value.bulanLalu.keluar
  const ini = data.value.bulanIni.keluar
  if (lalu === 0) return ini > 0 ? 100 : 0
  return Math.round(((ini - lalu) / lalu) * 100)
})

// Chart data - normalize ke persentase
const chartData = computed(() => {
  if (!data.value?.transaksi30Hari.length) return []
  const maxVal = Math.max(
    ...data.value.transaksi30Hari.map(d => Math.max(d.masuk, d.keluar)), 1
  )
  return data.value.transaksi30Hari.map(d => ({
    label: new Date(d.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    masuk: d.masuk,
    keluar: d.keluar,
    masukPct: Math.max(2, (d.masuk / maxVal) * 100),
    keluarPct: Math.max(2, (d.keluar / maxVal) * 100),
  }))
})

function formatAngka(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatTanggal(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function labelTipe(tipe: string): string {
  const map: Record<string, string> = {
    IN: 'Masuk', OUT: 'Keluar', TRANSFER: 'Transfer', ADJUSTMENT: 'Adjust'
  }
  return map[tipe] ?? tipe
}

function ikonTipe(tipe: string) {
  const map: Record<string, any> = {
    IN: ArrowDownToLineIcon,
    OUT: ArrowUpFromLineIcon,
    TRANSFER: ArrowRightLeftIcon,
    ADJUSTMENT: SlidersHorizontalIcon,
  }
  return map[tipe] ?? PackageIcon
}

async function ambilData() {
  sedangMemuat.value = true
  pesanError.value = null
  try {
    data.value = await $fetch<DashboardData>('/api/dashboard')
  } catch (err: any) {
    pesanError.value = err.data?.message ?? 'Gagal memuat data dashboard.'
  } finally {
    sedangMemuat.value = false
  }
}

onMounted(ambilData)
</script>