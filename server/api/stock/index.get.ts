import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const itemId = query.itemId ? Number(query.itemId) : null
  const gudangId = query.gudangId ? Number(query.gudangId) : null

  const kondisiItem = itemId ? 'AND item_id = ?' : ''
  const kondisiGudang = gudangId ? 'AND gabungan.gudang_id = ?' : ''
  const paramItem = itemId ? [itemId, itemId, itemId] : []
  const paramGudang = gudangId ? [gudangId] : []

  const stokPerGudang = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      gabungan.item_id    AS itemId,
      i.code              AS itemCode,
      i.name              AS itemName,
      u.name              AS unit,
      i.min_stock         AS minStock,
      gabungan.gudang_id  AS gudangId,
      g.name              AS gudangName,
      g.location          AS gudangLocation,
      SUM(gabungan.perubahan) AS quantity
    FROM (
      SELECT
        item_id,
        gudang_id,
        CASE
          WHEN type = 'IN'         THEN quantity
          WHEN type = 'OUT'        THEN -quantity
          WHEN type = 'ADJUSTMENT' THEN quantity
          ELSE 0
        END AS perubahan
      FROM inventory_transactions
      WHERE type IN ('IN', 'OUT', 'ADJUSTMENT')
      ${kondisiItem}

      UNION ALL

      SELECT
        item_id,
        gudang_id,
        -quantity AS perubahan
      FROM inventory_transactions
      WHERE type = 'TRANSFER' AND gudang_id IS NOT NULL
      ${kondisiItem}

      UNION ALL

      SELECT
        item_id,
        gudang_tujuan_id AS gudang_id,
        quantity AS perubahan
      FROM inventory_transactions
      WHERE type = 'TRANSFER' AND gudang_tujuan_id IS NOT NULL
      ${kondisiItem}
    ) AS gabungan
    JOIN items i  ON gabungan.item_id = i.id
    JOIN units u  ON i.unit_id = u.id
    JOIN gudang g ON gabungan.gudang_id = g.id
    WHERE gabungan.gudang_id IS NOT NULL
    ${kondisiGudang}
    GROUP BY gabungan.item_id, i.code, i.name, u.name, i.min_stock, gabungan.gudang_id, g.name, g.location
    ORDER BY i.name, g.name
  `, ...paramItem, ...paramGudang)

  return stokPerGudang.map(row => ({
    itemId:        Number(row.itemId),
    itemCode:      row.itemCode,
    itemName:      row.itemName,
    unit:          row.unit,
    minStock:      Number(row.minStock),
    gudangId:      Number(row.gudangId),
    gudangName:    row.gudangName,
    gudangLocation: row.gudangLocation,
    quantity:      Number(row.quantity),
  }))
})