-- CreateTable
CREATE TABLE "VehicleRegistration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "driverName" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "availableSlots" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'REUNIAO',
    "priceAdult" REAL NOT NULL DEFAULT 0,
    "priceChild" REAL NOT NULL DEFAULT 0,
    "maxSlots" INTEGER NOT NULL DEFAULT 0,
    "isBeneficente" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" TEXT,
    "accountabilityImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("accountabilityImageUrl", "classification", "createdAt", "date", "id", "location", "maxSlots", "name", "priceAdult", "priceChild", "updatedAt") SELECT "accountabilityImageUrl", "classification", "createdAt", "date", "id", "location", "maxSlots", "name", "priceAdult", "priceChild", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
