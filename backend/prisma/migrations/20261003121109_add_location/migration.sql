-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DengueReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "area" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "cases" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "latitude" REAL NOT NULL DEFAULT 0,
    "longitude" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_DengueReport" ("area", "cases", "createdAt", "description", "id", "riskLevel", "updatedAt") SELECT "area", "cases", "createdAt", "description", "id", "riskLevel", "updatedAt" FROM "DengueReport";
DROP TABLE "DengueReport";
ALTER TABLE "new_DengueReport" RENAME TO "DengueReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
