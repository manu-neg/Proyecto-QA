/*
  Warnings:

  - You are about to drop the column `clientId` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `clientName` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Chat` DROP FOREIGN KEY `Chat_clientId_fkey`;

-- AlterTable
ALTER TABLE `Chat` DROP COLUMN `clientId`,
    ADD COLUMN `clientName` VARCHAR(191) NOT NULL;
