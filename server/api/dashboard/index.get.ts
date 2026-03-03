import { prisma } from '../../utils/prisma'

export default defineEventHandler(async () => {
  // Ringkasan utama
  const [totalBarang, totalGudang, totalKategori] = await Promise.all([
    prisma.$queryRaw<{ total: bigint }[]>`SELECT COUNT(*) AS total FROM items`,
    prisma.$queryRaw<{ total: bigint }[]>`SELECT COUNT(*) AS total FROM gudang`,
    prisma.$queryRaw<{ total: bigint }[]>`SELECT COUNT(*) AS total FROM categories`,
  ])

  // Total stok semua barang
  const stokTotal = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COALESCE(SUM(
      CASE
        WHEN type = 'IN'         THEN quantity
        WHEN type = 'OUT'        THEN -quantity
        WHEN type = 'ADJUSTMENT' THEN quantity
        ELSE 0
      END
    ), 0) AS total
    FROM inventory_transactions
  `

  // Barang perlu restock (stok <= min_stock, stok > 0)
  const perluRestock = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*) AS total FROM (
      SELECT
        i.id,
        i.min_stock,
        COALESCE(SUM(
          CASE
            WHEN t.type = 'IN'         THEN t.quantity
            WHEN t.type = 'OUT'        THEN -t.quantity
            WHEN t.type = 'ADJUSTMENT' THEN t.quantity
            WHEN t.type = 'TRANSFER' AND t.gudang_id IS NOT NULL THEN 0
            ELSE 0
          END
        ), 0) AS stok
      FROM items i
      LEFT JOIN inventory_transactions t ON t.item_id = i.id
      GROUP BY i.id, i.min_stock
      HAVING stok > 0 AND stok <= i.min_stock
    ) AS sub
  `

  // Barang stok kosong
  const stokKosong = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*) AS total FROM (
      SELECT
        i.id,
        COALESCE(SUM(
          CASE
            WHEN t.type = 'IN'         THEN t.quantity
            WHEN t.type = 'OUT'        THEN -t.quantity
            WHEN t.type = 'ADJUSTMENT' THEN t.quantity
            ELSE 0
          END
        ), 0) AS stok
      FROM items i
      LEFT JOIN inventory_transactions t ON t.item_id = i.id
      GROUP BY i.id
      HAVING stok = 0
    ) AS sub
  `

  // Transaksi 30 hari terakhir per hari (untuk grafik)
  const transaksi30Hari = await prisma.$queryRaw<{
    tanggal: string
    masuk: bigint
    keluar: bigint
  }[]>`
    SELECT
      DATE(date) AS tanggal,
      COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0)  AS masuk,
      COALESCE(SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END), 0) AS keluar
    FROM inventory_transactions
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(date)
    ORDER BY tanggal ASC
  `

  // 5 transaksi terbaru
  const transaksiTerbaru = await prisma.$queryRaw<any[]>`
    SELECT
      t.id,
      t.transaction_code  AS kode,
      t.type              AS tipe,
      t.quantity,
      t.date,
      t.description,
      i.name              AS namaBarang,
      i.code              AS kodeBarang,
      u.name              AS unitName,
      g.name              AS namaGudang
    FROM inventory_transactions t
    JOIN items i ON t.item_id = i.id
    JOIN units u ON i.unit_id = u.id
    LEFT JOIN gudang g ON t.gudang_id = g.id
    ORDER BY t.created_at DESC
    LIMIT 8
  `

  // 5 barang stok paling rendah (hampir habis)
  const barangHampirHabis = await prisma.$queryRaw<any[]>`
    SELECT
      i.id,
      i.code,
      i.name,
      i.min_stock          AS minStok,
      u.name               AS satuan,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'IN'         THEN t.quantity
          WHEN t.type = 'OUT'        THEN -t.quantity
          WHEN t.type = 'ADJUSTMENT' THEN t.quantity
          ELSE 0
        END
      ), 0) AS stok
    FROM items i
    JOIN units u ON i.unit_id = u.id
    LEFT JOIN inventory_transactions t ON t.item_id = i.id
    GROUP BY i.id, i.code, i.name, i.min_stock, u.name
    ORDER BY stok ASC
    LIMIT 6
  `

  // Statistik bulan ini vs bulan lalu
  const statsBulanIni = await prisma.$queryRaw<{
    masuk: bigint; keluar: bigint; transfer: bigint
  }[]>`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'IN'       THEN quantity ELSE 0 END), 0) AS masuk,
      COALESCE(SUM(CASE WHEN type = 'OUT'      THEN quantity ELSE 0 END), 0) AS keluar,
      COALESCE(SUM(CASE WHEN type = 'TRANSFER' THEN quantity ELSE 0 END), 0) AS transfer
    FROM inventory_transactions
    WHERE MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())
  `

  const statsBulanLalu = await prisma.$queryRaw<{
    masuk: bigint; keluar: bigint
  }[]>`
    SELECT
      COALESCE(SUM(CASE WHEN type = 'IN'  THEN quantity ELSE 0 END), 0) AS masuk,
      COALESCE(SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END), 0) AS keluar
    FROM inventory_transactions
    WHERE MONTH(date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
      AND YEAR(date)  = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  `

  return {
    ringkasan: {
      totalBarang:  Number(totalBarang[0]?.total ?? 0),
      totalGudang:  Number(totalGudang[0]?.total ?? 0),
      totalKategori: Number(totalKategori[0]?.total ?? 0),
      stokTotal:    Number(stokTotal[0]?.total ?? 0),
      perluRestock: Number(perluRestock[0]?.total ?? 0),
      stokKosong:   Number(stokKosong[0]?.total ?? 0),
    },
    bulanIni: {
      masuk:    Number(statsBulanIni[0]?.masuk    ?? 0),
      keluar:   Number(statsBulanIni[0]?.keluar   ?? 0),
      transfer: Number(statsBulanIni[0]?.transfer ?? 0),
    },
    bulanLalu: {
      masuk:  Number(statsBulanLalu[0]?.masuk  ?? 0),
      keluar: Number(statsBulanLalu[0]?.keluar ?? 0),
    },
    transaksi30Hari: transaksi30Hari.map(t => ({
      tanggal: t.tanggal,
      masuk:   Number(t.masuk),
      keluar:  Number(t.keluar),
    })),
    transaksiTerbaru: transaksiTerbaru.map(t => ({
      ...t,
      quantity: Number(t.quantity),
    })),
    barangHampirHabis: barangHampirHabis.map(b => ({
      ...b,
      stok:    Number(b.stok),
      minStok: Number(b.minStok),
    })),
  }
})