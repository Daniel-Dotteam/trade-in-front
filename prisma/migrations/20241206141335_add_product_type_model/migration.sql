/*
  Warnings:

  - You are about to drop the column `collectionId` on the `Product` table. All the data in the column will be lost.
  - The `type` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `productTypeId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductSaleType" AS ENUM ('FOR_SALE', 'FOR_TRADE');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_collectionId_fkey";

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "productSaleTypes" "ProductSaleType"[];

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "collectionId",
ADD COLUMN     "productTypeId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ProductSaleType" NOT NULL DEFAULT 'FOR_SALE';

-- DropEnum
DROP TYPE "ProductType";

-- CreateTable
CREATE TABLE "ProductType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
