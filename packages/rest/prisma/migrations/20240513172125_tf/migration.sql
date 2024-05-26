-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('Imagine', 'ImagineVariants');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Queued', 'InProgress', 'Complete', 'Failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "shopifyVariantId" TEXT NOT NULL,
    "discordImageUrl" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "imagineDataId" TEXT,
    "allowVariants" BOOLEAN NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagineData" (
    "id" TEXT NOT NULL,
    "imagineFlags" INTEGER NOT NULL,
    "imagineHash" TEXT NOT NULL,
    "imaginePrompt" TEXT NOT NULL,
    "imagineId" TEXT NOT NULL,

    CONSTRAINT "ImagineData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_imagineDataId_fkey" FOREIGN KEY ("imagineDataId") REFERENCES "ImagineData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
