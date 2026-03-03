import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { PrismaClient } from '../server/generated/prisma/client'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? 'localhost',
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? 'rootpassword',
  database: process.env.DATABASE_NAME ?? 'inventory_atk',
  port: Number(process.env.DATABASE_PORT ?? 3306),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ================= USERS =================
  await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@inventory.com',
      username: 'admin',
      password:
        '$2b$12$goQTdxA80cRmj6v2DGVBROIkZRciBDjym1lkxLbU.k4vuYKZikCta',
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'staff@inventory.com' },
    update: {},
    create: {
      name: 'Staff Gudang',
      email: 'staff@inventory.com',
      username: 'staff',
      password:
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'STAFF',
    },
  })

  // ================= GUDANG =================
  await prisma.gudang.upsert({
    where: { name: 'Gudang Utama' },
    update: {},
    create: { name: 'Gudang Utama', location: 'Gedung A Lt.1' },
  })

  await prisma.gudang.upsert({
    where: { name: 'Gudang Cadangan' },
    update: {},
    create: { name: 'Gudang Cadangan', location: 'Gedung B Lt.2' },
  })

  await prisma.gudang.upsert({
    where: { name: 'Gudang TU' },
    update: {},
    create: { name: 'Gudang TU', location: 'Ruang Tata Usaha' },
  })

  await prisma.gudang.upsert({
    where: { name: 'Gudang Lab' },
    update: {},
    create: { name: 'Gudang Lab', location: 'Gedung C Lt.1' },
  })

  await prisma.gudang.upsert({
    where: { name: 'Gudang Arsip' },
    update: {},
    create: { name: 'Gudang Arsip', location: 'Gedung D Lt.2' },
  })

  // ================= CATEGORY =================
  const alatTulis = await prisma.category.upsert({
    where: { name: 'Alat Tulis' },
    update: {},
    create: { name: 'Alat Tulis' },
  })

  const kertas = await prisma.category.upsert({
    where: { name: 'Kertas' },
    update: {},
    create: { name: 'Kertas' },
  })

  const peralatan = await prisma.category.upsert({
    where: { name: 'Peralatan Kantor' },
    update: {},
    create: { name: 'Peralatan Kantor' },
  })

  // ================= SUB CATEGORY =================
  const subPena = await prisma.subCategory.upsert({
    where: { name_categoryId: { name: 'Pena & Pensil', categoryId: alatTulis.id } },
    update: {},
    create: { name: 'Pena & Pensil', categoryId: alatTulis.id },
  })

  const subSpidol = await prisma.subCategory.upsert({
    where: { name_categoryId: { name: 'Spidol & Marker', categoryId: alatTulis.id } },
    update: {},
    create: { name: 'Spidol & Marker', categoryId: alatTulis.id },
  })

  const subHVS = await prisma.subCategory.upsert({
    where: { name_categoryId: { name: 'Kertas HVS', categoryId: kertas.id } },
    update: {},
    create: { name: 'Kertas HVS', categoryId: kertas.id },
  })

  const subOffice = await prisma.subCategory.upsert({
    where: { name_categoryId: { name: 'Peralatan Umum', categoryId: peralatan.id } },
    update: {},
    create: { name: 'Peralatan Umum', categoryId: peralatan.id },
  })

  // ================= UNIT =================
  const pcs = await prisma.unit.upsert({
    where: { name: 'Pcs' },
    update: {},
    create: { name: 'Pcs' },
  })

  const box = await prisma.unit.upsert({
    where: { name: 'Box' },
    update: {},
    create: { name: 'Box' },
  })

  const rim = await prisma.unit.upsert({
    where: { name: 'Rim' },
    update: {},
    create: { name: 'Rim' },
  })

  // ================= 500 UNIQUE ITEMS =================
  const brands = ['Faber Castell', 'Pilot', 'Joyko', 'Standard', 'Snowman', 'Kenko', 'Deli', 'Bantex']
  const colors = ['Hitam', 'Biru', 'Merah', 'Hijau', 'Ungu']
  const sizes = ['0.5mm', '0.7mm', 'A4', 'F4', 'A3']
  const types = [
    { base: 'Pulpen Gel', sub: subPena, unit: box },
    { base: 'Pensil 2B', sub: subPena, unit: box },
    { base: 'Spidol Whiteboard', sub: subSpidol, unit: box },
    { base: 'Kertas HVS', sub: subHVS, unit: rim },
    { base: 'Stapler', sub: subOffice, unit: pcs },
    { base: 'Map Plastik', sub: subOffice, unit: pcs },
  ]

  let counter = 1

  outer: for (const type of types) {
    for (const brand of brands) {
      for (const color of colors) {
        for (const size of sizes) {
          if (counter > 500) break outer

          await prisma.item.upsert({
            where: { code: `ATK-${String(counter).padStart(4, '0')}` },
            update: {},
            create: {
              code: `ATK-${String(counter).padStart(4, '0')}`,
              name: `${type.base} ${brand} ${color} ${size}`,
              subCategoryId: type.sub.id,
              unitId: type.unit.id,
              minStock: Math.floor(Math.random() * 20) + 5,
            },
          })

          counter++
        }
      }
    }
  }

  console.log(`🎉 ${counter - 1} items inserted.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })