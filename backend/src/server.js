const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// เชื่อมต่อฐานข้อมูล Turso
// ==========================================

const databaseUrl = process.env.DATABASE_URL?.trim();
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Please configure it in Render Environment."
  );
}

if (!databaseUrl.startsWith("libsql://")) {
  throw new Error(
    "DATABASE_URL must be a valid Turso libsql:// URL."
  );
}

if (!tursoAuthToken) {
  throw new Error(
    "TURSO_AUTH_TOKEN is missing. Please configure it in Render Environment."
  );
}

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: tursoAuthToken
});

const prisma = new PrismaClient({ adapter });

console.log("Turso environment configuration detected.");

app.use(cors());
app.use(express.json());


// ==========================================
// TEST BACKEND
// ==========================================

app.get('/', (req, res) => {

  res.status(200).json({
    message: 'Dengue Portal Backend API is running...',
    status: 'online',
  });

});


// ==========================================
// GET : ดึงข้อมูลพื้นที่ทั้งหมด
// ==========================================

app.get('/api/reports', async (req, res) => {

  try {

    const reports =
      await prisma.dengueReport.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });


    res.status(200).json({
      success: true,
      data: reports,
    });

  } catch (error) {

    console.error(
      'Error fetching reports:',
      error
    );


    res.status(500).json({
      success: false,
      message: 'ไม่สามารถโหลดข้อมูลได้',
      error: error.message,
    });

  }

});


// ==========================================
// GET : ดูข้อมูลพื้นที่ตาม ID
// ==========================================

app.get('/api/reports/:id', async (req, res) => {

  try {

    const id =
      Number(req.params.id);


    if (!Number.isInteger(id)) {

      return res.status(400).json({
        success: false,
        message: 'ID ไม่ถูกต้อง',
      });

    }


    const report =
      await prisma.dengueReport.findUnique({
        where: {
          id,
        },
      });


    if (!report) {

      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลพื้นที่',
      });

    }


    res.status(200).json({
      success: true,
      data: report,
    });

  } catch (error) {

    console.error(
      'Get report error:',
      error
    );


    res.status(500).json({
      success: false,
      message: 'ไม่สามารถโหลดข้อมูลได้',
      error: error.message,
    });

  }

});


// ==========================================
// POST : เพิ่มข้อมูลพื้นที่
// ==========================================

app.post('/api/reports', async (req, res) => {

  try {

    const {
      area,
      riskLevel,
      cases,
      description,
      latitude,
      longitude,
    } = req.body;


    // ตรวจสอบชื่อพื้นที่
    if (
      typeof area !== 'string' ||
      area.trim() === ''
    ) {

      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อพื้นที่',
      });

    }


    // ตรวจสอบระดับความเสี่ยง
    const validRisks = [
      'สูง',
      'ปานกลาง',
      'ต่ำ',
    ];


    if (
      !validRisks.includes(riskLevel)
    ) {

      return res.status(400).json({
        success: false,
        message: 'ระดับความเสี่ยงไม่ถูกต้อง',
      });

    }


    // จำนวนผู้ป่วย
    const caseNumber =
      Number(cases ?? 0);


    if (
      !Number.isInteger(caseNumber) ||
      caseNumber < 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          'จำนวนผู้ป่วยต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
      });

    }


    // ตรวจสอบพิกัด
    const parsedLatitude =
      parseOptionalNumber(latitude);

    const parsedLongitude =
      parseOptionalNumber(longitude);


    if (
      parsedLatitude !== null &&
      (
        parsedLatitude < -90 ||
        parsedLatitude > 90
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Latitude ต้องอยู่ระหว่าง -90 ถึง 90',
      });

    }


    if (
      parsedLongitude !== null &&
      (
        parsedLongitude < -180 ||
        parsedLongitude > 180
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Longitude ต้องอยู่ระหว่าง -180 ถึง 180',
      });

    }


    const report =
      await prisma.dengueReport.create({

        data: {

          area:
            area.trim(),

          riskLevel,

          cases:
            caseNumber,

          description:
            normalizeDescription(
              description
            ),

          latitude:
            parsedLatitude,

          longitude:
            parsedLongitude,

        },

      });


    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลเรียบร้อยแล้ว',
      data: report,
    });

  } catch (error) {

    console.error(
      'Create report error:',
      error
    );


    res.status(500).json({
      success: false,
      message: 'ไม่สามารถเพิ่มข้อมูลได้',
      error: error.message,
    });

  }

});


// ==========================================
// PUT : แก้ไขข้อมูลพื้นที่
// ==========================================

app.put('/api/reports/:id', async (req, res) => {

  try {

    const id =
      Number(req.params.id);


    if (!Number.isInteger(id)) {

      return res.status(400).json({
        success: false,
        message: 'ID ไม่ถูกต้อง',
      });

    }


    const {
      area,
      riskLevel,
      cases,
      description,
      latitude,
      longitude,
    } = req.body;


    // ตรวจสอบชื่อพื้นที่
    if (
      typeof area !== 'string' ||
      area.trim() === ''
    ) {

      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อพื้นที่',
      });

    }


    // ตรวจสอบระดับความเสี่ยง
    const validRisks = [
      'สูง',
      'ปานกลาง',
      'ต่ำ',
    ];


    if (
      !validRisks.includes(riskLevel)
    ) {

      return res.status(400).json({
        success: false,
        message: 'ระดับความเสี่ยงไม่ถูกต้อง',
      });

    }


    // จำนวนผู้ป่วย
    const caseNumber =
      Number(cases ?? 0);


    if (
      !Number.isInteger(caseNumber) ||
      caseNumber < 0
    ) {

      return res.status(400).json({
        success: false,
        message:
          'จำนวนผู้ป่วยต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
      });

    }


    // ตรวจสอบพิกัด
    const parsedLatitude =
      parseOptionalNumber(latitude);

    const parsedLongitude =
      parseOptionalNumber(longitude);


    if (
      parsedLatitude !== null &&
      (
        parsedLatitude < -90 ||
        parsedLatitude > 90
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Latitude ต้องอยู่ระหว่าง -90 ถึง 90',
      });

    }


    if (
      parsedLongitude !== null &&
      (
        parsedLongitude < -180 ||
        parsedLongitude > 180
      )
    ) {

      return res.status(400).json({
        success: false,
        message:
          'Longitude ต้องอยู่ระหว่าง -180 ถึง 180',
      });

    }


    // ตรวจว่ามี ID นี้หรือไม่
    const existingReport =
      await prisma.dengueReport.findUnique({
        where: {
          id,
        },
      });


    if (!existingReport) {

      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลพื้นที่',
      });

    }


    const report =
      await prisma.dengueReport.update({

        where: {
          id,
        },

        data: {

          area:
            area.trim(),

          riskLevel,

          cases:
            caseNumber,

          description:
            normalizeDescription(
              description
            ),

          latitude:
            parsedLatitude,

          longitude:
            parsedLongitude,

        },

      });


    res.status(200).json({
      success: true,
      message: 'แก้ไขข้อมูลเรียบร้อยแล้ว',
      data: report,
    });

  } catch (error) {

    console.error(
      'Update report error:',
      error
    );


    res.status(500).json({
      success: false,
      message: 'ไม่สามารถแก้ไขข้อมูลได้',
      error: error.message,
    });

  }

});


// ==========================================
// DELETE : ลบข้อมูลพื้นที่
// ==========================================

app.delete('/api/reports/:id', async (req, res) => {

  try {

    const id =
      Number(req.params.id);


    if (!Number.isInteger(id)) {

      return res.status(400).json({
        success: false,
        message: 'ID ไม่ถูกต้อง',
      });

    }


    // ตรวจว่ามีข้อมูลก่อนลบ
    const existingReport =
      await prisma.dengueReport.findUnique({
        where: {
          id,
        },
      });


    if (!existingReport) {

      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลพื้นที่',
      });

    }


    await prisma.dengueReport.delete({
      where: {
        id,
      },
    });


    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลเรียบร้อยแล้ว',
    });

  } catch (error) {

    console.error(
      'Delete report error:',
      error
    );


    res.status(500).json({
      success: false,
      message: 'ไม่สามารถลบข้อมูลได้',
      error: error.message,
    });

  }

});


// ==========================================
// FUNCTION : แปลงค่าพิกัด
// ==========================================

function parseOptionalNumber(value) {

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {

    return null;

  }


  const number =
    Number(value);


  if (!Number.isFinite(number)) {

    return null;

  }


  return number;

}


// ==========================================
// FUNCTION : รายละเอียด
// ==========================================

function normalizeDescription(value) {

  if (
    typeof value !== 'string'
  ) {

    return null;

  }


  const text =
    value.trim();


  return text || null;

}

// =======================================
// SPRAYING SCHEDULE API
// =======================================

const crypto = require("node:crypto");

function sprayingAdmin(req, res, next) {
  const expected = process.env.API_ADMIN_KEY;
  const provided = req.get("x-admin-key") || "";

  if (!expected || !provided) {
    return res.status(403).json({
      success: false,
      message: "ไม่มีสิทธิ์แก้ไขข้อมูล"
    });
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);

  if (a.length !== b.length ||
    !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({
      success: false,
      message: "API Key ไม่ถูกต้อง"
    });
  }

  next();
}

function validSchedule(body) {
  const { district, location, scheduledAt, status, notes } = body;

  if (
    typeof district !== "string" ||
    !district.trim() ||
    district.length > 120 ||
    typeof location !== "string" ||
    !location.trim() ||
    location.length > 250 ||
    typeof scheduledAt !== "string" ||
    !Number.isFinite(Date.parse(scheduledAt)) ||
    !["scheduled", "completed", "cancelled"].includes(status) ||
    (notes != null && typeof notes !== "string")
  ) {
    return null;
  }

  return {
    district: district.trim(),
    location: location.trim(),
    scheduledAt: new Date(scheduledAt),
    status,
    notes: notes || null
  };
}

// GET: ผู้ใช้งานดูตารางนัดหมาย
app.get("/api/spraying", async (req, res) => {
  try {
    const { month } = req.query;
    let where = {};

    if (month !== undefined) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "รูปแบบเดือนต้องเป็น YYYY-MM"
        });
      }

      const [year, m] = month.split("-").map(Number);
      const start = new Date(Date.UTC(year, m - 1, 1, -7));
      const end = new Date(Date.UTC(year, m, 1, -7));

      where = {
        scheduledAt: { gte: start, lt: end }
      };
    }

    const data = await prisma.sprayingSchedule.findMany({
      where,
      orderBy: { scheduledAt: "asc" }
    });

    res.set("Cache-Control", "no-store");
    res.json({ success: true, data });

  } catch (error) {
    console.error("Spraying GET:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถโหลดตารางพ่นสารเคมีได้"
    });
  }
});

// POST: เพิ่มกำหนดการ
app.post("/api/spraying", sprayingAdmin, async (req, res) => {
  try {
    const data = validSchedule(req.body || {});

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลกำหนดการไม่ถูกต้อง"
      });
    }

    const created = await prisma.sprayingSchedule.create({ data });

    res.status(201).json({
      success: true,
      data: created
    });

  } catch (error) {
    console.error("Spraying POST:", error);
    res.status(500).json({
      success: false,
      message: "เพิ่มกำหนดการไม่สำเร็จ"
    });
  }
});

// PUT: แก้ไขกำหนดการ
app.put("/api/spraying/:id", sprayingAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = validSchedule(req.body || {});

    if (!Number.isSafeInteger(id) || id < 1 || !data) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ถูกต้อง"
      });
    }

    const updated = await prisma.sprayingSchedule.update({
      where: { id },
      data
    });

    res.json({ success: true, data: updated });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายการ"
      });
    }

    console.error("Spraying PUT:", error);
    res.status(500).json({
      success: false,
      message: "แก้ไขกำหนดการไม่สำเร็จ"
    });
  }
});

// DELETE: ลบกำหนดการ
app.delete("/api/spraying/:id", sprayingAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "รหัสรายการไม่ถูกต้อง"
      });
    }

    await prisma.sprayingSchedule.delete({
      where: { id }
    });

    res.json({ success: true });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "ไม่พบรายการ"
      });
    }

    console.error("Spraying DELETE:", error);
    res.status(500).json({
      success: false,
      message: "ลบกำหนดการไม่สำเร็จ"
    });
  }
});



// ==========================================
// START SERVER
// ==========================================

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;