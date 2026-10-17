
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

async function main() {
    const adapter = new PrismaLibSql({
        url: process.env.DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    const prisma = new PrismaClient({ adapter });

    try {
        console.log('กำลังทดสอบ Prisma กับ Turso...');

        const reports = await prisma.dengueReport.findMany();

        console.log('เชื่อมต่อ Prisma สำเร็จ!');
        console.log('จำนวนพื้นที่:', reports.length);
        console.log(reports);

    } catch (error) {
        console.error('Prisma Error:', error.message);
        console.error('Error Code:', error.code);
        console.error('Cause:', error.cause?.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
