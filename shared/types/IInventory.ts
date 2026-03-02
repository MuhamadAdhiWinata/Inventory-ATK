export type TransactionType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'

export interface InventoryTransaction {
  id: number
  transactionCode: string
  type: TransactionType
  date: string
  itemId: number
  itemName: string
  quantity: number
  unit: string
  gudangId: number | null
  gudangName: string | null
  gudangTujuanId: number | null
  gudangTujuanName: string | null
  note: string | null
  description: string | null
  userId: number
  userName: string
}

export interface InventoryResponse {
  data: InventoryTransaction[]
  success: boolean
  message: string
  total: number
  page: number
  limit: number
}

export interface GudangItem {
  id: number
  name: string
  location: string | null
}

export interface StockPerGudang {
  gudangId: number
  gudangName: string
  gudangLocation: string | null
  quantity: number
}

export interface StockItem {
  itemId: number
  itemCode: string
  itemName: string
  unit: string
  minStock: number
  totalStock: number
  status: 'Aman' | 'Perlu Restock'
  stockPerGudang: StockPerGudang[]
}