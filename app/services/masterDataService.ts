// app/services/masterDataService.ts
import type { MasterDataResponse } from '#shared/types/IMasterData'

export interface KategoriItem {
  id: number
  name: string
}

export interface SubKategoriItem {
  id: number
  name: string
  categoryId: number
}

export interface SatuanItem {
  id: number
  name: string
}

export class MasterDataService {
  async getItems(page = 1, limit = 10, kategori?: string): Promise<MasterDataResponse> {
    const params: Record<string, any> = { page, limit }
    if (kategori && kategori !== 'Semua') params.kategori = kategori

    return await $fetch<MasterDataResponse>('/api/items', { params })
  }

  async getCategories(): Promise<KategoriItem[]> {
    return await $fetch<KategoriItem[]>('/api/categories')
  }

  async getSubCategories() {
    return await $fetch<{ id: number; name: string; categoryId: number }[]>('/api/sub-categories')
  }

  async getUnits() {
    return await $fetch<{ id: number; name: string }[]>('/api/units')
  }
}

export const masterDataService = new MasterDataService()