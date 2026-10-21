
"use strict";

/* ==========================================
   DENGUE PORTAL
   ตารางพ่นสารเคมีกำจัดยุงสำหรับประชาชน
========================================== */

/*
  ใช้ API บนโดเมนเดียวกับเว็บไซต์เป็นค่าเริ่มต้น

  หาก Backend อยู่คนละโดเมน ให้กำหนด URL จริง เช่น
  window.DENGUE_API_BASE_URL = "https://your-backend.example.com";

  ต้องกำหนดค่าดังกล่าวก่อนโหลดไฟล์ spraying.js
*/

const API_BASE_URL = String(
    window.DENGUE_API_BASE_URL || ""
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/spraying`;

const $ = (id) => document.getElementById(id);

const month = $("month");
const district = $("district");
const rows = $("rows");
const stats = $("stats");
const message = $("message");
const reload = $("reload");

let records = [];
let isLoading = false;

/* ==========================================
   รายชื่อ 50 เขต กรุงเทพมหานคร
========================================== */

const BANGKOK_DISTRICTS = [
  "คลองเตย",
  "คลองสาน",
  "คลองสามวา",
  "คันนายาว",
  "จตุจักร",
  "จอมทอง",
  "ดอนเมือง",
  "ดินแดง",
  "ดุสิต",
  "ตลิ่งชัน",
  "ทวีวัฒนา",
  "ทุ่งครุ",
  "ธนบุรี",
  "บางกอกน้อย",
  "บางกอกใหญ่",
  "บางกะปิ",
  "บางขุนเทียน",
  "บางเขน",
  "บางคอแหลม",
  "บางแค",
  "บางซื่อ",
  "บางนา",
  "บางบอน",
  "บางพลัด",
  "บางรัก",
  "บึงกุ่ม",
  "ปทุมวัน",
  "ประเวศ",
  "ป้อมปราบศัตรูพ่าย",
  "พญาไท",
  "พระโขนง",
  "พระนคร",
  "ภาษีเจริญ",
  "มีนบุรี",
  "ยานนาวา",
  "ราชเทวี",
  "ราษฎร์บูรณะ",
  "ลาดกระบัง",
  "ลาดพร้าว",
  "วังทองหลาง",
  "วัฒนา",
  "สวนหลวง",
  "สะพานสูง",
  "สัมพันธวงศ์",
  "สาทร",
  "สายไหม",
  "หนองแขม",
  "หนองจอก",
  "หลักสี่",
  "ห้วยขวาง"
];

/* ==========================================
   สถานะ
========================================== */

const statusNames = {
    scheduled: "รอดำเนินการ",
    completed: "ดำเนินการแล้ว",
    cancelled: "ยกเลิก"
};

/* ==========================================
   จัดรูปแบบข้อมูล
========================================== */

function normalizeDistrict(value) {
    return String(value ?? "")
        .trim()
        .replace(/^เขต/, "")
        .trim();
}

function thaiDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        dateStyle: "medium",
        timeStyle: "short"
    });
}

function getBangkokMonth(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit"
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map((part) => [part.type, part.value])
    );

    return `${values.year}-${values.month}`;
}

function currentBangkokMonth() {
    return getBangkokMonth(new Date());
}

/* ==========================================
   สร้างรายการเขต
========================================== */

function populateDistricts() {
    if (!district) return;

    const selected = district.value;

    district.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "ทุกเขต";

    district.appendChild(allOption);

    const uniqueDistricts = [
        ...new Set(BANGKOK_DISTRICTS)
    ].sort((a, b) => a.localeCompare(b, "th"));

    uniqueDistricts.forEach((name) => {
        const option = document.createElement("option");

        option.value = name;
        option.textContent = `เขต${name}`;

        district.appendChild(option);
    });

    district.value = selected;
}

/* ==========================================
   แสดงข้อความ
========================================== */

function showMessage(text = "") {
    if (message) {
        message.textContent = text;
    }
}

/* ==========================================
   กรองข้อมูล
========================================== */

function filterRecords() {
    const selectedMonth = month?.value || "";
    const selectedDistrict = normalizeDistrict(
        district?.value || ""
    );

    return records.filter((item) => {
        const itemDistrict = normalizeDistrict(item.district);

        const matchDistrict =
            !selectedDistrict ||
            itemDistrict === selectedDistrict;

        const matchMonth =
            !selectedMonth ||
            getBangkokMonth(item.scheduledAt) === selectedMonth;

        return matchDistrict && matchMonth;
    });
}

/* ==========================================
   สร้างเซลล์ตาราง
========================================== */

function addCell(tr, value) {
    const td = document.createElement("td");

    td.textContent = value ?? "-";

    tr.appendChild(td);

    return td;
}

/* ==========================================
   แสดงตาราง
========================================== */

function displayReports() {
    if (!rows) return;

    rows.replaceChildren();

    const filtered = filterRecords();

    if (filtered.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.textContent =
            "ไม่พบกำหนดการพ่นสารเคมีในเดือนหรือเขตที่เลือก";

        tr.appendChild(td);
        rows.appendChild(tr);
    } else {
        filtered.sort(
            (a, b) =>
                new Date(a.scheduledAt) -
                new Date(b.scheduledAt)
        );

        filtered.forEach((item) => {
            const tr = document.createElement("tr");

            addCell(
                tr,
                `เขต${normalizeDistrict(item.district)}`
            );

            addCell(tr, item.location || "-");

            addCell(tr, thaiDate(item.scheduledAt));

            addCell(
                tr,
                statusNames[item.status] ||
                item.status ||
                "-"
            );

            addCell(tr, item.notes || "-");

            rows.appendChild(tr);
        });
    }

    displayStats(filtered);
}

/* ==========================================
   สรุปจำนวนครั้งต่อเขต
========================================== */

function displayStats(filtered) {
    if (!stats) return;

    stats.replaceChildren();

    const selectedDistrict = normalizeDistrict(
        district?.value || ""
    );

    const districts = selectedDistrict
        ? [selectedDistrict]
        : [...new Set(BANGKOK_DISTRICTS)]
            .sort((a, b) => a.localeCompare(b, "th"));

    districts.forEach((name) => {
        const count = filtered.filter(
            (item) =>
                normalizeDistrict(item.district) === name &&
                item.status !== "cancelled"
        ).length;

        const card = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = `เขต${name}`;

        const number = document.createElement("p");
        number.textContent = `${count} ครั้ง`;

        card.append(title, number);

        stats.appendChild(card);
    });
}

/* ==========================================
   โหลดข้อมูลจาก Backend
========================================== */

async function loadReports() {
    if (isLoading) return;

    isLoading = true;

    if (reload) {
        reload.disabled = true;
        reload.textContent = "กำลังโหลด...";
    }

    showMessage("");

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `ไม่สามารถโหลดข้อมูลได้ (HTTP ${response.status})`
            );
        }

        const contentType =
            response.headers.get("content-type") || "";

        if (!contentType.toLowerCase().includes("application/json")) {
            throw new Error(
                "Backend ไม่ได้ส่งข้อมูล JSON กรุณาตรวจสอบ API"
            );
        }

        const json = await response.json();

        if (!json.success || !Array.isArray(json.data)) {
            throw new Error(
                json.message || "รูปแบบข้อมูลจาก API ไม่ถูกต้อง"
            );
        }

        records = json.data;

        displayReports();

    } catch (error) {
        console.error("Spraying API Error:", error);
        console.error("API URL:", API_URL);

        records = [];

        if (rows) {
            rows.replaceChildren();

            const tr = document.createElement("tr");
            const td = document.createElement("td");

            td.colSpan = 5;
            td.textContent = "ไม่สามารถโหลดข้อมูลจากระบบได้";

            tr.appendChild(td);
            rows.appendChild(tr);
        }

        if (stats) {
            stats.textContent = "ไม่สามารถโหลดข้อมูลสรุปได้";
        }

        showMessage(
            `เกิดข้อผิดพลาด: ${error.message}`
        );

    } finally {
        isLoading = false;

        if (reload) {
            reload.disabled = false;
            reload.textContent = "🔄 โหลดข้อมูลล่าสุด";
        }
    }
}

/* ==========================================
   เริ่มต้นระบบ
========================================== */

function initialize() {
    populateDistricts();

    if (month && !month.value) {
        month.value = currentBangkokMonth();
    }

    month?.addEventListener("change", displayReports);
    district?.addEventListener("change", displayReports);
    reload?.addEventListener("click", loadReports);

    loadReports();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
} else {
    initialize();
}
