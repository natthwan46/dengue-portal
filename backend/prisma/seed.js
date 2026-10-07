import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dev.db อยู่ในโฟลเดอร์ prisma เดียวกับ seed.js
const dbPath = path.resolve(__dirname, 'dev.db');

const db = createClient({
    url: `file:${dbPath}`
});

// ==========================================
// ข้อมูลจำลองสำหรับทดสอบระบบ
// ==========================================

const reports = [
    {
        area: 'ตำบลท่าช้าง',
        riskLevel: 'สูง',
        cases: 18,
        description: 'พบผู้ป่วยเพิ่มขึ้นในพื้นที่',
        latitude: 13.7563,
        longitude: 100.5018
    },
    {
        area: 'ตำบลบ้านใหม่',
        riskLevel: 'สูง',
        cases: 15,
        description: 'พบผู้ป่วยหลายรายในชุมชน',
        latitude: 13.7420,
        longitude: 100.5150
    },
    {
        area: 'ตำบลหนองบัว',
        riskLevel: 'ปานกลาง',
        cases: 9,
        description: 'พบผู้ป่วยประปราย',
        latitude: 13.7700,
        longitude: 100.5300
    },
    {
        area: 'ตำบลคลองสอง',
        riskLevel: 'ปานกลาง',
        cases: 7,
        description: 'พบผู้ป่วยในบางหมู่บ้าน',
        latitude: 13.7800,
        longitude: 100.4900
    },
    {
        area: 'ตำบลสวนหลวง',
        riskLevel: 'ต่ำ',
        cases: 3,
        description: 'พบผู้ป่วยจำนวนน้อย',
        latitude: 13.7300,
        longitude: 100.5400
    },
    {
        area: 'ตำบลบางแก้ว',
        riskLevel: 'สูง',
        cases: 21,
        description: 'พบจำนวนผู้ป่วยสูงในช่วงที่ผ่านมา',
        latitude: 13.7500,
        longitude: 100.5600
    },
    {
        area: 'ตำบลห้วยขวาง',
        riskLevel: 'ปานกลาง',
        cases: 11,
        description: 'มีรายงานผู้ป่วยต่อเนื่อง',
        latitude: 13.7650,
        longitude: 100.5800
    },
    {
        area: 'ตำบลหนองจอก',
        riskLevel: 'ต่ำ',
        cases: 2,
        description: 'พบผู้ป่วยจำนวนน้อย',
        latitude: 13.8550,
        longitude: 100.8600
    },
    {
        area: 'ตำบลลาดกระบัง',
        riskLevel: 'สูง',
        cases: 17,
        description: 'พบผู้ป่วยเพิ่มขึ้น',
        latitude: 13.7200,
        longitude: 100.7500
    },
    {
        area: 'ตำบลคลองสาม',
        riskLevel: 'ปานกลาง',
        cases: 6,
        description: 'พบผู้ป่วยประปราย',
        latitude: 13.8200,
        longitude: 100.6200
    }
];


// ==========================================
// เพิ่มข้อมูลลงฐานข้อมูล
// ==========================================

async function main() {

    try {

        console.log('กำลังเพิ่มข้อมูล...');

        // ลบข้อมูลเดิม
        await db.execute(`
      DELETE FROM DengueReport
    `);

        // เพิ่มข้อมูลใหม่
        for (const report of reports) {

            await db.execute({
                sql: `
    INSERT INTO DengueReport
    (
      area,
      riskLevel,
      cases,
      description,
      latitude,
      longitude,
      createdAt,
      updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
                args: [
                    report.area,
                    report.riskLevel,
                    report.cases,
                    report.description,
                    report.latitude,
                    report.longitude,
                    new Date().toISOString(),
                    new Date().toISOString()
                ]
            });

        }

        console.log(
            `เพิ่มข้อมูล DengueReport จำนวน ${reports.length} รายการเรียบร้อยแล้ว`
        );

    } catch (error) {

        console.error('เกิดข้อผิดพลาด:', error);

    } finally {

        db.close();

    }
}


// ==========================================
// เริ่มทำงาน
// ==========================================

main();