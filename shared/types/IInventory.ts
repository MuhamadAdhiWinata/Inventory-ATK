// types/IInventory.ts
export type TransactionType = 'IN' | 'OUT'

export interface InventoryTransaction {
  id: number
  transactionId: string // IN-001, OUT-001
  type: TransactionType
  date: string
  itemName: string
  quantity: number
  sourceOrDestination: string // Supplier/Warehouse untuk IN, Customer/Production untuk OUT
  notes: string
  itemId?: number // Link ke master data
  unit?: string
}

export interface InventoryResponse {
  data: InventoryTransaction[]
  message: string
  success: boolean
  total: number
}