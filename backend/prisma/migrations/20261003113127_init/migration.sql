-- CreateTable
CREATE TABLE "DengueReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "area" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "cases" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
