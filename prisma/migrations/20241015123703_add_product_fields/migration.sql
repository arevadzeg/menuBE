-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "section" TEXT DEFAULT '',
ADD COLUMN     "sortOrder" DOUBLE PRECISION NOT NULL DEFAULT 0;
