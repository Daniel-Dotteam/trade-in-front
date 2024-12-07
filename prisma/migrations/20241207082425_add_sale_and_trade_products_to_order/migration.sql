/*
  Warnings:

  - You are about to drop the column `name` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "name",
DROP COLUMN "phoneNumber",
DROP COLUMN "productId",
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "saleProductId" TEXT,
ADD COLUMN     "tradeProductId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_saleProductId_fkey" FOREIGN KEY ("saleProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tradeProductId_fkey" FOREIGN KEY ("tradeProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
