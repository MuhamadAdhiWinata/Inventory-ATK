-- AlterTable
ALTER TABLE `inventory_transactions` ADD COLUMN `gudang_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `gudang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gudang_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventory_transactions` ADD CONSTRAINT `inventory_transactions_gudang_id_fkey` FOREIGN KEY (`gudang_id`) REFERENCES `gudang`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
