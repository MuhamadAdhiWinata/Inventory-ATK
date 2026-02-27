import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const { namaBarang, subKategoriId, satuanId, currentStock, stokMin } = body

  // Validasi
  if (!namaBarang || !subKategoriId || !satuanId) {
    throw createError({
      statusCode: 400,
      message: 'Semua field wajib diisi'
    })
  }

  // Cek item ada
    const existing = await prisma.$queryRawUnsafe<{ id: number }[]>(`
    SELECT id FROM items WHERE id = ?
    `, id)

    if (!existing.length) {
    throw createError({
        statusCode: 404,
        message: 'Barang tidak ditemukan'
    })
    }

  await prisma.$executeRawUnsafe(`
    UPDATE items
    SET name = ?, sub_category_id = ?, unit_id = ?, current_stock = ?, min_stock = ?, updated_at = NOW()
    WHERE id = ?
  `, namaBarang, subKategoriId, satuanId, currentStock, stokMin, id)

  return {
    success: true,
    message: 'Barang berhasil diperbarui'
  }
})