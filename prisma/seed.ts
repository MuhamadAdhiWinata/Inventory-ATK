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

  // ─────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inventory.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@inventory.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'ADMIN',
    },
  })

  const staff = await prisma.user.upsert({
    where: { email: 'staff@inventory.com' },
    update: {},
    create: {
      name: 'Staff Gudang',
      email: 'staff@inventory.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'STAFF',
    },
  })

  console.log('✅ Users seeded:', { admin: admin.email, staff: staff.email })

  // ─────────────────────────────────────────
  // GUDANG
  // ─────────────────────────────────────────
  const gudang = await Promise.all([
    prisma.gudang.upsert({
      where: { name: 'Gudang Utama' },
      update: {},
      create: { name: 'Gudang Utama', location: 'Gedung A Lt. 1' },
    }),
    prisma.gudang.upsert({
      where: { name: 'Gudang Cadangan' },
      update: {},
      create: { name: 'Gudang Cadangan', location: 'Gedung B Lt. 2' },
    }),
    prisma.gudang.upsert({
      where: { name: 'Gudang TU' },
      update: {},
      create: { name: 'Gudang TU', location: 'Ruang Tata Usaha' },
    }),
  ])

  const [gudangUtama, gudangCadangan, gudangTU] = gudang
  console.log('✅ Gudang seeded:', gudang.map(g => g.name))

  // ─────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Alat Tulis' }, update: {}, create: { name: 'Alat Tulis' } }),
    prisma.category.upsert({ where: { name: 'Kertas' }, update: {}, create: { name: 'Kertas' } }),
    prisma.category.upsert({ where: { name: 'Peralatan Kantor' }, update: {}, create: { name: 'Peralatan Kantor' } }),
  ])

  const [alatTulis, kertas, peralatanKantor] = categories
  console.log('✅ Categories seeded:', categories.map(c => c.name))

  // ─────────────────────────────────────────
  // SUB CATEGORIES
  // ─────────────────────────────────────────
  const subCategories = await Promise.all([
    prisma.subCategory.upsert({ where: { name_categoryId: { name: 'Pena & Pensil', categoryId: alatTulis.id } }, update: {}, create: { name: 'Pena & Pensil', categoryId: alatTulis.id } }),
    prisma.subCategory.upsert({ where: { name_categoryId: { name: 'Spidol & Marker', categoryId: alatTulis.id } }, update: {}, create: { name: 'Spidol & Marker', categoryId: alatTulis.id } }),
    prisma.subCategory.upsert({ where: { name_categoryId: { name: 'Kertas HVS', categoryId: kertas.id } }, update: {}, create: { name: 'Kertas HVS', categoryId: kertas.id } }),
    prisma.subCategory.upsert({ where: { name_categoryId: { name: 'Kertas Karton', categoryId: kertas.id } }, update: {}, create: { name: 'Kertas Karton', categoryId: kertas.id } }),
    prisma.subCategory.upsert({ where: { name_categoryId: { name: 'Stapler & Perforator', categoryId: peralatanKantor.id } }, update: {}, create: { name: 'Stapler & Perforator', categoryId: peralatanKantor.id } }),
    prisma.subCategory.upsert({ where: { name_categoryId: { name: 'Gunting & Cutter', categoryId: peralatanKantor.id } }, update: {}, create: { name: 'Gunting & Cutter', categoryId: peralatanKantor.id } }),
  ])

  const [subPena, subSpidol, subHVS, subKarton, subStapler, subGunting] = subCategories
  console.log('✅ SubCategories seeded:', subCategories.map(s => s.name))

  // ─────────────────────────────────────────
  // UNITS
  // ─────────────────────────────────────────
  const units = await Promise.all([
    prisma.unit.upsert({ where: { name: 'Pcs' }, update: {}, create: { name: 'Pcs' } }),
    prisma.unit.upsert({ where: { name: 'Rim' }, update: {}, create: { name: 'Rim' } }),
    prisma.unit.upsert({ where: { name: 'Box' }, update: {}, create: { name: 'Box' } }),
    prisma.unit.upsert({ where: { name: 'Lusin' }, update: {}, create: { name: 'Lusin' } }),
    prisma.unit.upsert({ where: { name: 'Pack' }, update: {}, create: { name: 'Pack' } }),
  ])

  const [pcs, rim, box, lusin, pack] = units
  console.log('✅ Units seeded:', units.map(u => u.name))

  // ─────────────────────────────────────────
  // ITEMS (30 items)
  // ─────────────────────────────────────────
  const items = await Promise.all([
    // Alat Tulis - Pena & Pensil (10 items)
    prisma.item.upsert({ where: { code: 'ATK-001' }, update: {}, create: { code: 'ATK-001', name: 'Pulpen Pilot G2', subCategoryId: subPena.id, unitId: box.id, currentStock: 50, minStock: 10 } }),
    prisma.item.upsert({ where: { code: 'ATK-002' }, update: {}, create: { code: 'ATK-002', name: 'Pensil 2B Faber Castell', subCategoryId: subPena.id, unitId: box.id, currentStock: 8, minStock: 10 } }),
    prisma.item.upsert({ where: { code: 'ATK-003' }, update: {}, create: { code: 'ATK-003', name: 'Pulpen Snowman 0.5mm', subCategoryId: subPena.id, unitId: box.id, currentStock: 30, minStock: 10 } }),
    prisma.item.upsert({ where: { code: 'ATK-004' }, update: {}, create: { code: 'ATK-004', name: 'Pensil HB Staedtler', subCategoryId: subPena.id, unitId: box.id, currentStock: 4, minStock: 10 } }),
    prisma.item.upsert({ where: { code: 'ATK-005' }, update: {}, create: { code: 'ATK-005', name: 'Pulpen Gel Hitam Joyko', subCategoryId: subPena.id, unitId: box.id, currentStock: 25, minStock: 10 } }),
    prisma.item.upsert({ where: { code: 'ATK-006' }, update: {}, create: { code: 'ATK-006', name: 'Pensil Warna 24 Warna', subCategoryId: subPena.id, unitId: pcs.id, currentStock: 15, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-007' }, update: {}, create: { code: 'ATK-007', name: 'Ballpoint Boxy 0.7mm', subCategoryId: subPena.id, unitId: box.id, currentStock: 2, minStock: 10 } }),
    prisma.item.upsert({ where: { code: 'ATK-008' }, update: {}, create: { code: 'ATK-008', name: 'Rautan Pensil', subCategoryId: subPena.id, unitId: pcs.id, currentStock: 20, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-009' }, update: {}, create: { code: 'ATK-009', name: 'Penghapus Pensil Lyra', subCategoryId: subPena.id, unitId: pcs.id, currentStock: 40, minStock: 15 } }),
    prisma.item.upsert({ where: { code: 'ATK-010' }, update: {}, create: { code: 'ATK-010', name: 'Correction Pen Snowman', subCategoryId: subPena.id, unitId: pcs.id, currentStock: 3, minStock: 10 } }),

    // Alat Tulis - Spidol & Marker (5 items)
    prisma.item.upsert({ where: { code: 'ATK-011' }, update: {}, create: { code: 'ATK-011', name: 'Spidol Whiteboard Snowman', subCategoryId: subSpidol.id, unitId: box.id, currentStock: 15, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-012' }, update: {}, create: { code: 'ATK-012', name: 'Spidol Permanent Hitam', subCategoryId: subSpidol.id, unitId: box.id, currentStock: 10, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-013' }, update: {}, create: { code: 'ATK-013', name: 'Highlighter 5 Warna', subCategoryId: subSpidol.id, unitId: pack.id, currentStock: 8, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-014' }, update: {}, create: { code: 'ATK-014', name: 'Marker Biru Joyko', subCategoryId: subSpidol.id, unitId: box.id, currentStock: 2, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-015' }, update: {}, create: { code: 'ATK-015', name: 'Spidol OHP Merah', subCategoryId: subSpidol.id, unitId: pcs.id, currentStock: 12, minStock: 5 } }),

    // Kertas - HVS (5 items)
    prisma.item.upsert({ where: { code: 'ATK-016' }, update: {}, create: { code: 'ATK-016', name: 'Kertas HVS A4 80gr', subCategoryId: subHVS.id, unitId: rim.id, currentStock: 3, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-017' }, update: {}, create: { code: 'ATK-017', name: 'Kertas HVS F4 70gr', subCategoryId: subHVS.id, unitId: rim.id, currentStock: 20, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-018' }, update: {}, create: { code: 'ATK-018', name: 'Kertas HVS A3 80gr', subCategoryId: subHVS.id, unitId: rim.id, currentStock: 5, minStock: 3 } }),
    prisma.item.upsert({ where: { code: 'ATK-019' }, update: {}, create: { code: 'ATK-019', name: 'Kertas HVS Warna A4', subCategoryId: subHVS.id, unitId: rim.id, currentStock: 2, minStock: 3 } }),
    prisma.item.upsert({ where: { code: 'ATK-020' }, update: {}, create: { code: 'ATK-020', name: 'Kertas Buram F4', subCategoryId: subHVS.id, unitId: rim.id, currentStock: 10, minStock: 5 } }),

    // Kertas - Karton (3 items)
    prisma.item.upsert({ where: { code: 'ATK-021' }, update: {}, create: { code: 'ATK-021', name: 'Kertas Karton Putih A3', subCategoryId: subKarton.id, unitId: pcs.id, currentStock: 50, minStock: 20 } }),
    prisma.item.upsert({ where: { code: 'ATK-022' }, update: {}, create: { code: 'ATK-022', name: 'Kertas Manila Warna', subCategoryId: subKarton.id, unitId: pcs.id, currentStock: 8, minStock: 20 } }),
    prisma.item.upsert({ where: { code: 'ATK-023' }, update: {}, create: { code: 'ATK-023', name: 'Kertas Duplex 400gr', subCategoryId: subKarton.id, unitId: pcs.id, currentStock: 30, minStock: 10 } }),

    // Peralatan Kantor - Stapler (4 items)
    prisma.item.upsert({ where: { code: 'ATK-024' }, update: {}, create: { code: 'ATK-024', name: 'Stapler Kangaro No.10', subCategoryId: subStapler.id, unitId: pcs.id, currentStock: 10, minStock: 3 } }),
    prisma.item.upsert({ where: { code: 'ATK-025' }, update: {}, create: { code: 'ATK-025', name: 'Isi Staples No.10', subCategoryId: subStapler.id, unitId: box.id, currentStock: 2, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-026' }, update: {}, create: { code: 'ATK-026', name: 'Perforator 2 Lubang', subCategoryId: subStapler.id, unitId: pcs.id, currentStock: 5, minStock: 2 } }),
    prisma.item.upsert({ where: { code: 'ATK-027' }, update: {}, create: { code: 'ATK-027', name: 'Stapler Besar No.24', subCategoryId: subStapler.id, unitId: pcs.id, currentStock: 3, minStock: 2 } }),

    // Peralatan Kantor - Gunting (3 items)
    prisma.item.upsert({ where: { code: 'ATK-028' }, update: {}, create: { code: 'ATK-028', name: 'Gunting Kenko 8"', subCategoryId: subGunting.id, unitId: pcs.id, currentStock: 2, minStock: 5 } }),
    prisma.item.upsert({ where: { code: 'ATK-029' }, update: {}, create: { code: 'ATK-029', name: 'Cutter Besar Joyko', subCategoryId: subGunting.id, unitId: pcs.id, currentStock: 8, minStock: 3 } }),
    prisma.item.upsert({ where: { code: 'ATK-030' }, update: {}, create: { code: 'ATK-030', name: 'Isi Cutter Besar', subCategoryId: subGunting.id, unitId: pack.id, currentStock: 1, minStock: 5 } }),
  ])

  console.log('✅ Items seeded:', items.length, 'items')

  // ─────────────────────────────────────────
  // INVENTORY TRANSACTIONS (dengan transaction_code & gudang)
  // ─────────────────────────────────────────
  const txData = [
    // IN
    { code: 'IN-001', itemId: items[0].id,  userId: admin.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 50, note: 'Stock awal',         description: 'Pengadaan awal tahun', date: new Date('2026-01-01') },
    { code: 'IN-002', itemId: items[1].id,  userId: admin.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 20, note: 'Stock awal',         description: 'Pengadaan awal tahun', date: new Date('2026-01-01') },
    { code: 'IN-003', itemId: items[2].id,  userId: admin.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 30, note: 'Stock awal',         description: 'Pengadaan awal tahun', date: new Date('2026-01-01') },
    { code: 'IN-004', itemId: items[3].id,  userId: admin.id, type: 'IN' as const, gudangId: gudangCadangan.id, quantity: 15, note: 'Stock awal',         description: 'Pengadaan awal tahun', date: new Date('2026-01-01') },
    { code: 'IN-005', itemId: items[4].id,  userId: admin.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 25, note: 'Stock awal',         description: 'Pengadaan awal tahun', date: new Date('2026-01-01') },
    { code: 'IN-006', itemId: items[10].id, userId: admin.id, type: 'IN' as const, gudangId: gudangTU.id,       quantity: 15, note: 'Pembelian rutin',    description: 'Pembelian semester genap', date: new Date('2026-01-10') },
    { code: 'IN-007', itemId: items[15].id, userId: staff.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 10, note: 'Restock kertas',     description: 'Restock bulanan',     date: new Date('2026-01-15') },
    { code: 'IN-008', itemId: items[16].id, userId: staff.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 5,  note: 'Restock kertas',     description: 'Restock bulanan',     date: new Date('2026-01-15') },
    { code: 'IN-009', itemId: items[5].id,  userId: staff.id, type: 'IN' as const, gudangId: gudangTU.id,       quantity: 10, note: 'Pembelian tambahan', description: null,                  date: new Date('2026-02-01') },
    { code: 'IN-010', itemId: items[23].id, userId: admin.id, type: 'IN' as const, gudangId: gudangUtama.id,    quantity: 20, note: 'Stock awal',         description: 'Pengadaan peralatan', date: new Date('2026-02-05') },

    // OUT
    { code: 'OUT-001', itemId: items[1].id,  userId: staff.id, type: 'OUT' as const, gudangId: gudangUtama.id,    quantity: 12, note: 'Dipakai kelas X',       description: 'Distribusi ke kelas',  date: new Date('2026-01-15') },
    { code: 'OUT-002', itemId: items[3].id,  userId: staff.id, type: 'OUT' as const, gudangId: gudangCadangan.id, quantity: 11, note: 'Dipakai administrasi',   description: 'Kebutuhan TU',         date: new Date('2026-01-20') },
    { code: 'OUT-003', itemId: items[6].id,  userId: staff.id, type: 'OUT' as const, gudangId: gudangUtama.id,    quantity: 8,  note: 'Dipakai lab',            description: 'Kebutuhan lab komputer', date: new Date('2026-02-01') },
    { code: 'OUT-004', itemId: items[15].id, userId: staff.id, type: 'OUT' as const, gudangId: gudangUtama.id,    quantity: 3,  note: 'Cetak dokumen rapat',    description: null,                   date: new Date('2026-02-10') },
    { code: 'OUT-005', itemId: items[10].id, userId: staff.id, type: 'OUT' as const, gudangId: gudangTU.id,       quantity: 5,  note: 'Dipakai kelas XI',       description: 'Distribusi ke kelas',  date: new Date('2026-02-15') },
  ]

  for (const tx of txData) {
    await prisma.inventoryTransaction.upsert({
      where: { transactionCode: tx.code },
      update: {},
      create: {
        transactionCode: tx.code,
        itemId: tx.itemId,
        userId: tx.userId,
        type: tx.type,
        gudangId: tx.gudangId,
        quantity: tx.quantity,
        note: tx.note,
        description: tx.description,
        date: tx.date,
      },
    })
  }

  console.log('✅ Transactions seeded:', txData.length, 'transactions')
  console.log('')
  console.log('🎉 Seeding completed!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Admin  → admin@inventory.com / admin123')
  console.log('   Staff  → staff@inventory.com / staff123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })