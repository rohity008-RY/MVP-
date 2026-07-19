CREATE TABLE "RewardLedger" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "parentOrderId" TEXT,
    "points" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardLedger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RewardLedger_customerId_idx" ON "RewardLedger"("customerId");
CREATE INDEX "RewardLedger_parentOrderId_idx" ON "RewardLedger"("parentOrderId");
CREATE INDEX "RewardLedger_createdAt_idx" ON "RewardLedger"("createdAt");

ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_parentOrderId_fkey" FOREIGN KEY ("parentOrderId") REFERENCES "ParentOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

