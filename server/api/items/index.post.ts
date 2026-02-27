import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { namaBarang, subKategoriId, satuanId, currentStock, stokMin } = body

  // Validasi
  if (!namaBarang || !subKategoriId || !satuanId) {
    throw createError({
      statusCode: 400,
      message: 'Semua field wajib diisi'
    })
  }

  // Generate kode barang
  const lastItem = await prisma.$queryRaw<[{ code: string }]>`
    SELECT code FROM items
    WHERE code LIKE 'ATK-%'
    ORDER BY id DESC
    LIMIT 1
  `

  let newCode = 'ATK-001'
  if (lastItem.length > 0) {
    const lastNumber = parseInt(lastItem[0].code.replace('ATK-', ''))
    newCode = `ATK-${String(lastNumber + 1).padStart(3, '0')}`
  }

  // Insert
  await prisma.$executeRawUnsafe(`
    INSERT INTO items (code, name, sub_category_id, unit_id, current_stock, min_stock, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, newCode, namaBarang, subKategoriId, satuanId, currentStock ?? 0, stokMin ?? 0)

  return {
    success: true,
    message: 'Barang berhasil ditambahkan',
    kodeBarang: newCode
  }
})