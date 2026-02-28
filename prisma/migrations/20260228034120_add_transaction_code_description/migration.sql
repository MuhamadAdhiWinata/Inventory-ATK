/*
  Warnings:

  - A unique constraint covering the columns `[transaction_code]` on the table `inventory_transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transaction_code` to the `inventory_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inventory_transactions` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `transaction_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `inventory_transactions_transaction_code_key` ON `inventory_transactions`(`transaction_code`);
