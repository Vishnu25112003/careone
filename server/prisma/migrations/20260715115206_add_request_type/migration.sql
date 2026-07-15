-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('ENQUIRY', 'CALLBACK');

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "type" "RequestType" NOT NULL DEFAULT 'ENQUIRY';
