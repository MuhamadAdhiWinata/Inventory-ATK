// types/IMasterData.ts
export type ItemCategory = 'ATK' | 'Bahan Praktik' | 'Perlengkapan Kelas' | 'Kebersihan'
export type StockStatus = 'Aman' | 'Perlu Restock'

export interface MasterItem {
  id: number
  kodeBarang: string
  namaBarang: string
  kategori: ItemCategory
  subKategori: string
  satuan: string
  currentStock: number
  stokMin: number
  status?: StockStatus // Calculated field
}

export interface MasterDataResponse {
  data: MasterItem[]
  message: string
  success: boolean
  total: number
  page: number
  limit: number
}