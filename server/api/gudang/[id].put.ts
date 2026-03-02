import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { nama, lokasi } = body

  if (!nama?.trim()) {
    throw createError({ statusCode: 400, message: 'Nama gudang wajib diisi' })
  }

  const gudangYangAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM gudang WHERE id = ?`, id
  )
  if (!gudangYangAda.length) {
    throw createError({ statusCode: 404, message: 'Gudang tidak ditemukan' })
  }

  const namaDuplikat = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM gudang WHERE name = ? AND id != ?`, nama.trim(), id
  )
  if (namaDuplikat.length) {
    throw createError({ statusCode: 409, message: 'Nama gudang sudah digunakan' })
  }

  await prisma.$executeRawUnsafe(
    `UPDATE gudang SET name = ?, location = ?, updated_at = NOW() WHERE id = ?`,
    nama.trim(), lokasi?.trim() || null, id
  )

  return { success: true, message: 'Gudang berhasil diperbarui' }
})