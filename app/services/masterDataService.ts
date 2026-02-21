// app/services/masterDataService.ts
import type { MasterDataResponse } from '#shared/types/IMasterData'

export class MasterDataService {
  async getItems(page = 1, limit = 10, kategori?: string): Promise<MasterDataResponse> {
    const params: Record<string, any> = { page, limit }
    if (kategori && kategori !== 'Semua') params.kategori = kategori

    return await $fetch<MasterDataResponse>('/api/items', { params })
  }

  async getCategories(): Promise<string[]> {
    return await $fetch<string[]>('/api/categories')
  }
}

export const masterDataService = new MasterDataService()