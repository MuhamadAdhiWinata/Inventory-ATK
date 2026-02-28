export type TransactionType = 'IN' | 'OUT'

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
  note: string | null
  description: string | null
  userId: number
  userName: string
}

export interface InventoryResponse {
  data: InventoryTransaction[]
  message: string
  success: boolean
  total: number
  page: number
  limit: number
}

export interface GudangItem {
  id: number
  name: string
  location: string | null
}