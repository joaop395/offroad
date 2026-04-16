PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "classification" TEXT NOT NULL,
    "priceAdult" REAL NOT NULL,
    "priceChild" REAL NOT NULL,
    "maxSlots" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Event" (
    "id",
    "name",
    "date",
    "location",
    "classification",
    "priceAdult",
    "priceChild",
    "maxSlots",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "name",
    "date",
    "location",
    "difficulty",
    "priceAdult",
    "priceChild",
    "maxSlots",
    "createdAt",
    "updatedAt"
FROM "Event";

DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
