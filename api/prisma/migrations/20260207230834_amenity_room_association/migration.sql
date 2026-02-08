/*
  Warnings:

  - You are about to drop the column `hotel_id` on the `amenities` table. All the data in the column will be lost.
  - You are about to drop the `_AmenityToRoom` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[room_id,name]` on the table `amenities` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `room_id` to the `amenities` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `payment_method` on the `bookings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- Step 1: Delete all existing amenities (cannot be automatically migrated from hotel to room)
DELETE FROM "amenities";

-- Step 2: Drop foreign key constraints
-- DropForeignKey
ALTER TABLE "_AmenityToRoom" DROP CONSTRAINT "_AmenityToRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_AmenityToRoom" DROP CONSTRAINT "_AmenityToRoom_B_fkey";

-- DropForeignKey
ALTER TABLE "amenities" DROP CONSTRAINT "amenities_hotel_id_fkey";

-- Step 3: Drop old unique index
-- DropIndex
DROP INDEX "amenities_hotel_id_name_key";

-- Step 4: Modify amenities table structure
-- AlterTable
ALTER TABLE "amenities" DROP COLUMN "hotel_id",
ADD COLUMN     "room_id" UUID NOT NULL;

-- Step 5: Handle payment_method column change
-- First, update existing data to use text values
ALTER TABLE "bookings" ALTER COLUMN "payment_method" TYPE TEXT USING payment_method::TEXT;

-- Step 6: Drop the join table
-- DropTable
DROP TABLE "_AmenityToRoom";

-- Step 7: Drop the old enum (if it exists)
-- DropEnum
DROP TYPE IF EXISTS "PaymentMethod";

-- Step 8: Create new unique index
-- CreateIndex
CREATE UNIQUE INDEX "amenities_room_id_name_key" ON "amenities"("room_id", "name");

-- Step 9: Add new foreign key
-- AddForeignKey
ALTER TABLE "amenities" ADD CONSTRAINT "amenities_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
