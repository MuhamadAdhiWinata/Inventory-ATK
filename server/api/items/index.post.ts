import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { namaBarang, subKategoriId, satuanId, stokMin } = body

  if (!namaBarang || !subKategoriId || !satuanId) {
    throw createError({ statusCode: 400, message: 'Semua field wajib diisi' })
  }

  // Generate kode barang
  const itemTerakhir = await prisma.$queryRaw<[{ code: string }]>`
    SELECT code FROM items WHERE code LIKE 'ATK-%' ORDER BY id DESC LIMIT 1
  `

  let kodeBaru = 'ATK-001'
  if (itemTerakhir.length > 0 && itemTerakhir[0]) {
    const nomorTerakhir = parseInt(itemTerakhir[0].code.replace('ATK-', ''))
    kodeBaru = `ATK-${String(nomorTerakhir + 1).padStart(3, '0')}`
  }

  await prisma.$executeRawUnsafe(`
    INSERT INTO items (code, name, sub_category_id, unit_id, min_stock, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
  `, kodeBaru, namaBarang, subKategoriId, satuanId, stokMin ?? 0)

  return {
    success: true,
    message: 'Barang berhasil ditambahkan',
    kodeBarang: kodeBaru
  }
})