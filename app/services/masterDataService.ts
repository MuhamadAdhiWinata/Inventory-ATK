// app/services/masterDataService.ts
import type { MasterDataResponse, MasterItem } from '#shared/types/IMasterData'

export class MasterDataService {
  async getItems(page = 1, limit = 10, kategori?: string): Promise<MasterDataResponse> {
    const params: Record<string, any> = { page, limit }
    if (kategori && kategori !== 'Semua') params.kategori = kategori

    const { data, error } = await useFetch<MasterDataResponse>('/api/items', { params })

    if (error.value) throw error.value
    return data.value!
  }

  async getCategories(): Promise<string[]> {
    const { data } = await useFetch<string[]>('/api/categories')
    return data.value ?? ['Semua']
  }
}

export const masterDataService = new MasterDataService()