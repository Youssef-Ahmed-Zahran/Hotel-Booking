/*
  Warnings:

  - You are about to drop the column `image_url` on the `hotels` table. All the data in the column will be lost.
  - You are about to drop the `_AmenityToApartment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AmenityToApartment" DROP CONSTRAINT "_AmenityToApartment_A_fkey";

-- DropForeignKey
ALTER TABLE "_AmenityToApartment" DROP CONSTRAINT "_AmenityToApartment_B_fkey";

-- AlterTable
ALTER TABLE "hotels" DROP COLUMN "image_url",
ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "_AmenityToApartment";

-- CreateIndex
CREATE INDEX "apartments_name_idx" ON "apartments"("name");

-- CreateIndex
CREATE INDEX "hotels_name_idx" ON "hotels"("name");

-- CreateIndex
CREATE INDEX "rooms_room_number_idx" ON "rooms"("room_number");
