-- CreateTable
CREATE TABLE "restaurant_info" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Restaurant',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "room" TEXT NOT NULL DEFAULT '',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_info_pkey" PRIMARY KEY ("id")
);
