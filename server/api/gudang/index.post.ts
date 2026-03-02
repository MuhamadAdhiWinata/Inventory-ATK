import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nama, lokasi } = body

  if (!nama?.trim()) {
    throw createError({ statusCode: 400, message: 'Nama gudang wajib diisi' })
  }

  const sudahAda = await prisma.$queryRawUnsafe<{ id: number }[]>(
    `SELECT id FROM gudang WHERE name = ?`, nama.trim()
  )
  if (sudahAda.length) {
    throw createError({ statusCode: 409, message: 'Nama gudang sudah digunakan' })
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO gudang (name, location, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
    nama.trim(), lokasi?.trim() || null
  )

  return { success: true, message: 'Gudang berhasil ditambahkan' }
})