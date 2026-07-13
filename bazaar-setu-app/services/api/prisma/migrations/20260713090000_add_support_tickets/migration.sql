-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('NEW', 'ASSIGNED', 'WAITING_CUSTOMER', 'WAITING_SELLER', 'WAITING_DELIVERY', 'REFUND_REVIEW', 'RESOLVED', 'REOPENED');

-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "SupportTicketSource" AS ENUM ('CUSTOMER', 'SELLER', 'OPS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SupportMessageVisibility" AS ENUM ('INTERNAL', 'CUSTOMER', 'SELLER', 'BOTH');

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "source" "SupportTicketSource" NOT NULL,
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'NEW',
    "priority" "SupportTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customerId" TEXT,
    "sellerId" TEXT,
    "parentOrderId" TEXT,
    "subOrderId" TEXT,
    "createdByUserId" TEXT,
    "assignedToUserId" TEXT,
    "slaDueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "reopenedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "authorRole" TEXT NOT NULL,
    "visibility" "SupportMessageVisibility" NOT NULL DEFAULT 'INTERNAL',
    "message" TEXT NOT NULL,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_ticketNumber_key" ON "SupportTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "SupportTicket_status_priority_idx" ON "SupportTicket"("status", "priority");

-- CreateIndex
CREATE INDEX "SupportTicket_customerId_idx" ON "SupportTicket"("customerId");

-- CreateIndex
CREATE INDEX "SupportTicket_sellerId_idx" ON "SupportTicket"("sellerId");

-- CreateIndex
CREATE INDEX "SupportTicket_parentOrderId_idx" ON "SupportTicket"("parentOrderId");

-- CreateIndex
CREATE INDEX "SupportTicket_subOrderId_idx" ON "SupportTicket"("subOrderId");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedToUserId_idx" ON "SupportTicket"("assignedToUserId");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- CreateIndex
CREATE INDEX "SupportTicket_slaDueAt_idx" ON "SupportTicket"("slaDueAt");

-- CreateIndex
CREATE INDEX "SupportTicketMessage_ticketId_idx" ON "SupportTicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX "SupportTicketMessage_authorUserId_idx" ON "SupportTicketMessage"("authorUserId");

-- CreateIndex
CREATE INDEX "SupportTicketMessage_createdAt_idx" ON "SupportTicketMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_parentOrderId_fkey" FOREIGN KEY ("parentOrderId") REFERENCES "ParentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_subOrderId_fkey" FOREIGN KEY ("subOrderId") REFERENCES "SellerSubOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketMessage" ADD CONSTRAINT "SupportTicketMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
