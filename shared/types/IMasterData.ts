export interface MasterItem {
  id: number
  kodeBarang: string
  namaBarang: string
  kategori: string
  subKategori: string
  satuan: string
  totalStock: number
  stokMin: number
  status: 'Aman' | 'Perlu Restock'
}

export interface MasterDataResponse {
  data: MasterItem[]
  success: boolean
  message: string
  total: number
  page: number
  limit: number
}