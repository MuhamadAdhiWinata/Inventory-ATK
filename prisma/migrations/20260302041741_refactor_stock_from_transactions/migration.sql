/*
  Warnings:

  - You are about to drop the column `current_stock` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `inventory_transactions` ADD COLUMN `gudang_tujuan_id` INTEGER NULL,
    MODIFY `type` ENUM('IN', 'OUT', 'TRANSFER', 'ADJUSTMENT') NOT NULL;

-- AlterTable
ALTER TABLE `items` DROP COLUMN `current_stock`;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_gudang_tujuan_id_fkey` FOREIGN KEY (`gudang_tujuan_id`) REFERENCES `gudang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
