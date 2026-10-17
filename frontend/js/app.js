
/* ========================================
   DENGUE PORTAL - MAIN APPLICATION
   ======================================== */

// ========================================
// 1. API CONFIG
// ========================================

// เปลี่ยนเป็น URL Backend จริงจาก Render
// ตัวอย่าง: https://dengue-portal-api.onrender.com
const ONLINE_API = '';

// รองรับ localhost และ IP ภายในเครือข่าย Wi-Fi
const LOCAL_API = `http://${window.location.hostname}:5000`;

// เลือก API ตามสภาพแวดล้อม
const API_BASE =
    window.location.protocol === 'https:'
        ? ONLINE_API
        : LOCAL_API;

const API_URL = `${API_BASE}/api/reports`;

// อัปเดตทุก 30 วินาที
const REFRESH_INTERVAL = 30000;

// ========================================
// 2. GLOBAL VARIABLES
// ========================================

let riskMap = null;
let riskMarkerLayer = null;
let refreshTimer = null;
let isLoadingReports = false;
let deferredPrompt = null;

// ========================================
// 3. HELPER FUNCTIONS
// ========================================

function getRiskClass(level) {
    if (level === 'สูง') return 'high-risk';
    if (level === 'ปานกลาง') return 'medium-risk';
    if (level === 'ต่ำ') return 'low-risk';
    return '';
}

function getMarkerColor(level) {
    if (level === 'สูง') return '#dc2626';
    if (level === 'ปานกลาง') return '#f59e0b';
    if (level === 'ต่ำ') return '#16a34a';
    return '#64748b';
}

// ป้องกัน HTML ที่ไม่ปลอดภัยจากข้อมูล API
function escapeHTML(value) {
    return String(value ?? '').replace(
        /[&<>"']/g,
        char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]
    );
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

function updateLastUpdated() {
    const now = new Date();

    const time = now.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    setText('lastUpdated', `อัปเดตล่าสุด: ${time}`);
}

// ========================================
// 4. INITIALIZE MAP
// ========================================

function initMap() {
    const mapElement = document.getElementById('riskMap');

    if (!mapElement) {
        console.warn('ไม่พบ Element riskMap');
        return;
    }

    if (typeof L === 'undefined') {
        console.error('Leaflet ยังไม่ถูกโหลด');
        return;
    }

    if (riskMap) return;

    riskMap = L.map('riskMap').setView(
        [13.7563, 100.5018],
        10
    );

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }
    ).addTo(riskMap);

    riskMarkerLayer = L.layerGroup().addTo(riskMap);

    // ปรับขนาดแผนที่หลังแสดงหน้าเว็บ
    setTimeout(() => {
        riskMap.invalidateSize();
    }, 300);

    console.log('สร้างแผนที่สำเร็จ');
}

// ========================================
// 5. ADD RISK MARKERS
// ========================================

function addRiskMarkers(reports) {
    if (!riskMap || !riskMarkerLayer) return;

    // ลบจุดเก่าทั้งหมดก่อนเพิ่มจุดใหม่
    riskMarkerLayer.clearLayers();

    reports.forEach(report => {
        if (
            report.latitude == null ||
            report.longitude == null ||
            report.latitude === '' ||
            report.longitude === ''
        ) {
            return;
        }

        const latitude = Number(report.latitude);
        const longitude = Number(report.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            Math.abs(latitude) > 90 ||
            Math.abs(longitude) > 180 ||
            latitude === 0 ||
            longitude === 0
        ) {
            return;
        }

        const color = getMarkerColor(report.riskLevel);

        const marker = L.circleMarker(
            [latitude, longitude],
            {
                radius: 10,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillColor: color,
                fillOpacity: 0.85
            }
        );

        marker.bindPopup(`
            <div class="map-popup">
                <h3>${escapeHTML(report.area)}</h3>

                <p>
                    <strong>ระดับความเสี่ยง:</strong>
                    ${escapeHTML(report.riskLevel)}
                </p>

                <p>
                    <strong>จำนวนผู้ป่วย:</strong>
                    ${Number(report.cases) || 0} ราย
                </p>

                <p>
                    <strong>รายละเอียด:</strong>
                    ${escapeHTML(report.description || '-')}
                </p>

                <small>ข้อมูลจำลองสำหรับทดสอบระบบ</small>
            </div>
        `);

        marker.addTo(riskMarkerLayer);
    });

    console.log('อัปเดตจุดพื้นที่เสี่ยงบนแผนที่แล้ว');
}

// ========================================
// 6. UPDATE SUMMARY
// ========================================

function updateSummary(reports) {
    const totalCases = reports.reduce(
        (total, report) =>
            total + (Number(report.cases) || 0),
        0
    );

    const highRisk = reports.filter(
        report => report.riskLevel === 'สูง'
    ).length;

    const mediumRisk = reports.filter(
        report => report.riskLevel === 'ปานกลาง'
    ).length;

    const lowRisk = reports.filter(
        report => report.riskLevel === 'ต่ำ'
    ).length;

    setText('totalCases', totalCases);
    setText('highRisk', highRisk);
    setText('mediumRisk', mediumRisk);
    setText('lowRisk', lowRisk);
}

// ========================================
// 7. UPDATE REPORT TABLE
// ========================================

function updateReportTable(reports) {
    const table = document.getElementById('reportTable');
    const reportBody = document.getElementById('reportBody');

    if (!table || !reportBody) return;

    reportBody.innerHTML = '';

    reports.forEach(report => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${escapeHTML(report.area)}</td>

            <td>
                <span class="risk ${getRiskClass(report.riskLevel)}">
                    ${escapeHTML(report.riskLevel)}
                </span>
            </td>

            <td>${Number(report.cases) || 0} ราย</td>

            <td>${escapeHTML(report.description || '-')}</td>
        `;

        reportBody.appendChild(row);
    });

    table.style.display =
        reports.length > 0 ? 'table' : 'none';
}

// ========================================
// 8. LOAD REPORTS FROM BACKEND
// ========================================

async function loadReports() {
    // ป้องกันการโหลดข้อมูลซ้อนกัน
    if (isLoadingReports) return;

    isLoadingReports = true;

    const loading = document.getElementById('loading');
    const errorElement = document.getElementById('error');

    try {
        if (!API_BASE) {
            throw new Error(
                'ยังไม่ได้ตั้งค่า URL Backend ออนไลน์'
            );
        }

        console.log('กำลังโหลดข้อมูลจาก:', API_URL);

        const response = await fetch(API_URL, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {
            throw new Error(
                result.message || 'รูปแบบข้อมูล API ไม่ถูกต้อง'
            );
        }

        const reports = result.data;

        console.log('โหลดข้อมูลสำเร็จ:', reports.length);

        // อัปเดต Dashboard
        updateSummary(reports);

        // อัปเดตตาราง
        updateReportTable(reports);

        // อัปเดตแผนที่
        addRiskMarkers(reports);

        // แสดงเวลาโหลดสำเร็จ
        updateLastUpdated();

        if (loading) {
            loading.style.display = 'none';
        }

        if (errorElement) {
            errorElement.style.display = 'none';
        }

    } catch (error) {
        console.error('โหลดข้อมูลไม่สำเร็จ:', error);

        if (loading) {
            loading.style.display = 'none';
        }

        if (errorElement) {
            errorElement.textContent =
                `ไม่สามารถโหลดข้อมูลจาก Backend ได้: ${error.message}`;

            errorElement.style.display = 'block';
        }

        // คงข้อมูลล่าสุดที่เคยโหลดสำเร็จไว้
        setText(
            'lastUpdated',
            'ไม่สามารถตรวจสอบข้อมูลล่าสุดได้'
        );

    } finally {
        isLoadingReports = false;
    }
}

// ========================================
// 9. AUTO REFRESH EVERY 30 SECONDS
// ========================================

function startAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }

    // โหลดครั้งแรก
    loadReports();

    // โหลดข้อมูลใหม่ทุก 30 วินาที
    refreshTimer = setInterval(() => {
        if (!document.hidden) {
            loadReports();
        }
    }, REFRESH_INTERVAL);

    console.log('เปิดระบบ Auto Refresh ทุก 30 วินาที');
}

// เมื่อกลับมาที่หน้าเว็บให้ตรวจข้อมูลล่าสุด
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadReports();
    }
});

// ========================================
// 10. REGISTER SERVICE WORKER
// ========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration =
                await navigator.serviceWorker.register(
                    './service-worker.js'
                );

            console.log(
                'Service Worker registered:',
                registration.scope
            );

        } catch (error) {
            console.error(
                'Service Worker registration failed:',
                error
            );
        }
    });
}

// ========================================
// 11. PWA INSTALL
// ========================================

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();

    deferredPrompt = event;

    const installAppBtn =
        document.getElementById('installAppBtn');

    if (installAppBtn) {
        installAppBtn.style.display = 'block';
    }

    console.log('PWA พร้อมสำหรับการติดตั้ง');
});

async function installPWA() {
    if (!deferredPrompt) {
        console.log('ยังไม่มี Install Prompt');
        return;
    }

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    console.log('Install result:', result.outcome);

    deferredPrompt = null;

    const installAppBtn =
        document.getElementById('installAppBtn');

    if (installAppBtn) {
        installAppBtn.style.display = 'none';
    }
}

window.addEventListener('appinstalled', () => {
    console.log('Dengue Portal installed successfully');

    deferredPrompt = null;

    const installAppBtn =
        document.getElementById('installAppBtn');

    if (installAppBtn) {
        installAppBtn.style.display = 'none';
    }
});

// ========================================
// 12. START APPLICATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dengue Portal เริ่มทำงาน');

    // สร้างแผนที่
    initMap();

    // เริ่มโหลดข้อมูลอัตโนมัติ
    startAutoRefresh();

    // ปุ่มติดตั้งแอป
    const installAppBtn =
        document.getElementById('installAppBtn');

    if (installAppBtn) {
        installAppBtn.addEventListener(
            'click',
            installPWA
        );
    }
});
