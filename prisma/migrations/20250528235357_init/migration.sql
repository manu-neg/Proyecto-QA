/*
  Warnings:

  - Made the column `clientId` on table `Orders` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Orders` DROP FOREIGN KEY `Orders_clientId_fkey`;

-- AlterTable
ALTER TABLE `Orders` MODIFY `clientId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
