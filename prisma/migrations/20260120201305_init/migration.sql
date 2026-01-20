-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "suspendedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "locations" TEXT NOT NULL,
    "timeWindowStart" DATETIME NOT NULL,
    "timeWindowEnd" DATETIME NOT NULL,
    "deliveryMethod" TEXT NOT NULL,
    "deliveryBuilding" TEXT,
    "deliveryNotes" TEXT,
    "dietaryTags" TEXT NOT NULL,
    "dietaryNotes" TEXT,
    "pickupAlias" TEXT NOT NULL,
    "fulfilledLocation" TEXT,
    "grubhubOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" DATETIME,
    "fulfilledAt" DATETIME,
    "completedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "requesterId" TEXT NOT NULL,
    "fulfillerId" TEXT,
    CONSTRAINT "Request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_fulfillerId_fkey" FOREIGN KEY ("fulfillerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolution" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Flag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
