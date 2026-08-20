/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Pendente';

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");
