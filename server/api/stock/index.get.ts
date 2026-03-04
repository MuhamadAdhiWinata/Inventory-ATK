import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const itemId = query.itemId ? Number(query.itemId) : null
  const gudangId = query.gudangId ? Number(query.gudangId) : null

  const kondisiItem = itemId ? 'AND t.item_id = ?' : ''
  const kondisiGudangWhere = gudangId ? 'WHERE g.id = ?' : ''
  const kondisiItemWhere = itemId ? (gudangId ? 'AND i.id = ?' : 'WHERE i.id = ?') : ''

  const params: number[] = []
  // 3x karena UNION ALL 3 bagian masing-masing filter item
  if (itemId) params.push(itemId, itemId, itemId)
  // filter gudang dan item di query luar
  if (gudangId) params.push(gudangId)
  if (itemId) params.push(itemId)

  const rows = await prisma.$queryRawUnsafe<any[]>(`
    SELECT
      i.id                AS itemId,
      i.code              AS itemCode,
      i.name              AS itemName,
      u.name              AS unit,
      i.min_stock         AS minStock,
      g.id                AS gudangId,
      g.name              AS gudangName,
      g.location          AS gudangLocation,
      COALESCE(SUM(t.perubahan), 0) AS quantity
    FROM items i
    JOIN units u ON u.id = i.unit_id
    CROSS JOIN gudang g
    LEFT JOIN (
      SELECT item_id, gudang_id,
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

      SELECT item_id, gudang_id, -quantity AS perubahan
      FROM inventory_transactions
      WHERE type = 'TRANSFER' AND gudang_id IS NOT NULL
      ${kondisiItem}

      UNION ALL

      SELECT item_id, gudang_tujuan_id AS gudang_id, quantity AS perubahan
      FROM inventory_transactions
      WHERE type = 'TRANSFER' AND gudang_tujuan_id IS NOT NULL
      ${kondisiItem}
    ) AS t ON t.item_id = i.id AND t.gudang_id = g.id
    ${kondisiGudangWhere}
    ${kondisiItemWhere}
    GROUP BY i.id, i.code, i.name, u.name, i.min_stock, g.id, g.name, g.location
    ORDER BY i.name ASC, g.name ASC
  `, ...params)

  return rows.map(row => ({
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