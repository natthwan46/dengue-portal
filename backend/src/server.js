const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const app = express();
const PORT = process.env.PORT || 5000;


// ==========================================
// DATABASE
// ==========================================

const dbPath = path.resolve(
  __dirname,
  '../prisma/dev.db'
);

const adapter = new PrismaLibSql({
  url: `file:${dbPath}`,
});

const prisma = new PrismaClient({
  adapter,
});


// ==========================================
// MIDDLEWARE
// ==========================================

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


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});