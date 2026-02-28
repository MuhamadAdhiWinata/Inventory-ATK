import type { InventoryResponse, InventoryTransaction, GudangItem, TransactionType } from '#shared/types/IInventory'

export class InventoryService {
  async getTransactions(
    type: TransactionType,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<InventoryResponse> {
    const params: Record<string, any> = { type, page, limit }
    if (search) params.search = search
    return await $fetch<InventoryResponse>('/api/transactions', { params })
  }

  async getGudang(): Promise<GudangItem[]> {
    return await $fetch<GudangItem[]>('/api/gudang')
  }
}

export const inventoryService = new InventoryService()