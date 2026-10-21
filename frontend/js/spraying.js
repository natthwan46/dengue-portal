
/* ==========================================
   DENGUE PORTAL
   ตารางพ่นสารเคมีกำจัดยุง
   สำหรับ 50 เขต กรุงเทพมหานคร
========================================== */

/* ==========================================
   1. API CONFIG
========================================== */

// Backend สำหรับทดสอบในเครื่อง
const API_URL = "http://localhost:5000/api/spraying";

// เมื่อ Deploy ต้องเปลี่ยนเป็น URL Backend ออนไลน์
// ตัวอย่าง:
// const API_URL = "https://your-backend.onrender.com/api/spraying";

const REFRESH_INTERVAL = 60 * 1000;

/* ==========================================
   2. รายชื่อ 50 เขต กรุงเทพมหานคร
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
   3. HTML ELEMENTS
========================================== */

const month = document.getElementById("month");
const district = document.getElementById("district");
const rows = document.getElementById("rows");
const stats = document.getElementById("stats");
const message = document.getElementById("message");
const reload = document.getElementById("reload");

let records = [];
let isLoading = false;

/* ==========================================
   4. STATUS
========================================== */

const statusNames = {
    scheduled: "รอดำเนินการ",
    completed: "ดำเนินการแล้ว",
    cancelled: "ยกเลิก"
};

/* ==========================================
   5. จัดรูปแบบชื่อเขต
========================================== */

function normalizeDistrict(value) {
    return String(value ?? "")
        .trim()
        .replace(/^เขต/, "")
        .trim();
}

/* ==========================================
   6. สร้าง Dropdown 50 เขต
========================================== */

function populateBangkokDistricts() {
    if (!district) return;

    const previousValue = normalizeDistrict(district.value);

    district.replaceChildren();

    district.add(
        new Option("ทุกเขตในกรุงเทพมหานคร", "")
    );

    BANGKOK_DISTRICTS.forEach((name) => {
        district.add(
            new Option(`เขต${name}`, name)
        );
    });

    if (BANGKOK_DISTRICTS.includes(previousValue)) {
        district.value = previousValue;
    }
}

/* ==========================================
   7. กรองข้อมูลตามเขต
========================================== */

function filterByDistrict(reports, selectedDistrict) {
    if (!selectedDistrict) {
        return reports;
    }

    return reports.filter((report) => {
        const reportDistrict = normalizeDistrict(
            report.district
        );

        return reportDistrict === normalizeDistrict(
            selectedDistrict
        );
    });
}

/* ==========================================
   8. เดือนปัจจุบันตามเวลาไทย
========================================== */

function getCurrentMonth() {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit"
    }).formatToParts(new Date());

    const year = parts.find(
        p => p.type === "year"
    ).value;

    const monthNumber = parts.find(
        p => p.type === "month"
    ).value;

    return `${year}-${monthNumber}`;
}

/* ==========================================
   9. แปลงวันที่เป็นภาษาไทย
========================================== */

function thaiDate(value) {
    if (!value) return "-";

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

/* ==========================================
   10. เพิ่มเซลล์ในตาราง
========================================== */

function addCell(tr, value) {
    const td = document.createElement("td");

    td.textContent = value ?? "-";

    tr.appendChild(td);

    return td;
}

/* ==========================================
   11. แสดงข้อความสถานะ
========================================== */

function showMessage(text, isError = false) {
    if (!message) return;

    message.className = isError
        ? "result-message error"
        : "result-message";

    message.textContent = text;
}

/* ==========================================
   12. ตรวจสอบเดือนของรายการ
========================================== */

function getBangkokMonth(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit"
    }).formatToParts(date);

    const year = parts.find(
        p => p.type === "year"
    ).value;

    const monthNumber = parts.find(
        p => p.type === "month"
    ).value;

    return `${year}-${monthNumber}`;
}

/* ==========================================
   13. กรองข้อมูลตามเดือน
========================================== */

function filterByMonth(reports, selectedMonth) {
    if (!selectedMonth) {
        return reports;
    }

    return reports.filter((report) => {
        return getBangkokMonth(report.scheduledAt)
            === selectedMonth;
    });
}

/* ==========================================
   14. แสดงตารางและสถิติ
========================================== */

function displayReports() {
    if (!rows || !stats || !district || !month) {
        return;
    }

    rows.replaceChildren();
    stats.replaceChildren();

    // กรองเดือน
    const monthFiltered = filterByMonth(
        records,
        month.value
    );

    // กรองเขต
    const filtered = filterByDistrict(
        monthFiltered,
        district.value
    );

    // เรียงตามวันเวลาที่กำหนด
    filtered.sort((a, b) => {
        return new Date(a.scheduledAt) -
            new Date(b.scheduledAt);
    });

    const counts = {};

    filtered.forEach((item) => {
        const districtName = normalizeDistrict(
            item.district
        );

        // ไม่นับรายการที่ยกเลิก
        if (item.status !== "cancelled") {
            counts[districtName] =
                (counts[districtName] || 0) + 1;
        }

        const tr = document.createElement("tr");

        addCell(
            tr,
            districtName ? `เขต${districtName}` : "-"
        );

        addCell(tr, item.location);
        addCell(tr, thaiDate(item.scheduledAt));

        const statusCell = addCell(
            tr,
            statusNames[item.status] ||
            item.status ||
            "-"
        );

        if (item.status) {
            statusCell.classList.add(
                `status-${item.status}`
            );
        }

        addCell(tr, item.notes);

        rows.appendChild(tr);
    });

    /* ===== แสดงสถิติ ===== */

    Object.entries(counts)

    /* ==========================================
       แสดงสถิติครบ 50 เขต กรุงเทพมหานคร
    ========================================== */

    const selectedDistrict = normalizeDistrict(district.value);

    const districtsToShow = selectedDistrict
        ? [selectedDistrict]
        : BANGKOK_DISTRICTS;

    districtsToShow.forEach((name) => {
        const count = counts[name] || 0;

        const card = document.createElement("div");
        card.className = "stat";

        if (count > 0) {
            card.textContent =
                `เขต${name}: ${count} ครั้ง/เดือน`;
        } else {
            card.textContent =
                `เขต${name}: ยังไม่มีข้อมูลกำหนดการ`;
        }

        stats.appendChild(card);
    });


    /* ===== ไม่มีข้อมูล ===== */

    if (filtered.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.className = "empty-cell";

        td.textContent =
            "ยังไม่พบกำหนดการพ่นสารเคมีที่บันทึกไว้ในเดือนและเขตที่เลือก";

        tr.appendChild(td);
        rows.appendChild(tr);

        const emptyStat = document.createElement("div");

        emptyStat.className = "stat";

        emptyStat.textContent =
            "ยังไม่มีข้อมูลจำนวนครั้งในเดือนนี้";

        stats.appendChild(emptyStat);
    }

    showMessage(
        filtered.length > 0
            ? `พบกำหนดการ ${filtered.length} รายการ`
            : "ยังไม่พบกำหนดการในเดือนและเขตที่เลือก"
    );
}

/* ==========================================
   15. โหลดข้อมูลจาก Backend API
========================================== */

async function loadReports() {
    if (isLoading) return;

    isLoading = true;

    showMessage("กำลังโหลดข้อมูลล่าสุด...");

    try {
        const params = new URLSearchParams();

        if (month.value) {
            params.set("month", month.value);
        }

        const url = `${API_URL}?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `Backend ตอบกลับ HTTP ${response.status}`
            );
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(
                result.message || "โหลดข้อมูลไม่สำเร็จ"
            );
        }

        const apiRecords = Array.isArray(result.data)
            ? result.data
            : [];

        // รับเฉพาะรายการที่อยู่ใน 50 เขต
        records = apiRecords.filter((item) => {
            const name = normalizeDistrict(item.district);

            return BANGKOK_DISTRICTS.includes(name);
        });

        // ไม่ลบ Dropdown 50 เขต
        displayReports();

    } catch (error) {
        console.error("Spraying API Error:", error);

        records = [];

        rows.replaceChildren();
        stats.replaceChildren();

        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 5;
        td.className = "empty-cell";

        td.textContent =
            "ไม่สามารถเชื่อมต่อข้อมูลกำหนดการได้";

        tr.appendChild(td);
        rows.appendChild(tr);

        showMessage(
            `ไม่สามารถโหลดข้อมูลได้: ${error.message}`,
            true
        );

    } finally {
        isLoading = false;
    }
}

/* ==========================================
   16. EVENTS
========================================== */

function initializeSprayingPage() {
    if (
        !month ||
        !district ||
        !rows ||
        !stats ||
        !message
    ) {
        console.error(
            "ไม่พบองค์ประกอบ HTML ที่จำเป็น"
        );
        return;
    }

    // กำหนดเดือนปัจจุบัน
    month.value = getCurrentMonth();

    // แสดง 50 เขต
    populateDistrictSelect("district", true);

    // เปลี่ยนเดือน
    month.addEventListener("change", () => {
        loadReports();
    });

    // เปลี่ยนเขต
    district.addEventListener("change", () => {
        displayReports();
    });

    // ปุ่มโหลดข้อมูลล่าสุด
    if (reload) {
        reload.addEventListener("click", () => {
            loadReports();
        });
    }

    // โหลดข้อมูลทุก 60 วินาที
    setInterval(() => {
        if (!document.hidden) {
            loadReports();
        }
    }, REFRESH_INTERVAL);

    // กลับมาเปิดแท็บ
    document.addEventListener(
        "visibilitychange",
        () => {
            if (!document.hidden) {
                loadReports();
            }
        }
    );

    // โหลดข้อมูลครั้งแรก
    loadReports();
}

/* ==========================================
   17. START APPLICATION
========================================== */

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeSprayingPage
    );
} else {
    initializeSprayingPage();
}
