// ========================================
// API CONFIG
// ========================================

// ใช้ IP/Hostname เดียวกับเครื่องที่เปิด Frontend
const API_BASE = `http://${window.location.hostname}:5000`;
const API_URL = `${API_BASE}/api/reports`;

let riskMap;


// ========================================
// โหลดข้อมูลจาก Backend
// ========================================

async function loadReports() {

    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const table = document.getElementById('reportTable');
    const reportBody = document.getElementById('reportBody');

    try {

        console.log('กำลังเชื่อมต่อ API:', API_URL);

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        console.log('ข้อมูลจาก API:', result);

        const reports = result.data || [];


        // ========================================
        // คำนวณข้อมูลสรุป
        // ========================================

        const totalCases = reports.reduce(
            (total, report) =>
                total + Number(report.cases || 0),
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


        // ========================================
        // แสดงข้อมูล Summary
        // ========================================

        const totalCasesElement =
            document.getElementById('totalCases');

        const highRiskElement =
            document.getElementById('highRisk');

        const mediumRiskElement =
            document.getElementById('mediumRisk');

        const lowRiskElement =
            document.getElementById('lowRisk');

        if (totalCasesElement) {
            totalCasesElement.textContent = totalCases;
        }

        if (highRiskElement) {
            highRiskElement.textContent = highRisk;
        }

        if (mediumRiskElement) {
            mediumRiskElement.textContent = mediumRisk;
        }

        if (lowRiskElement) {
            lowRiskElement.textContent = lowRisk;
        }


        // ========================================
        // แสดงข้อมูลในตาราง
        // ========================================

        if (reportBody) {

            reportBody.innerHTML = '';

            reports.forEach(report => {

                const row =
                    document.createElement('tr');

                row.innerHTML = `
                    <td>${report.area}</td>

                    <td>
                        <span class="risk ${getRiskClass(report.riskLevel)}">
                            ${report.riskLevel}
                        </span>
                    </td>

                    <td>
                        ${report.cases} ราย
                    </td>

                    <td>
                        ${report.description || '-'}
                    </td>
                `;

                reportBody.appendChild(row);

            });

        }


        // ========================================
        // ซ่อน Loading
        // ========================================

        if (loading) {
            loading.style.display = 'none';
        }

        if (table && reports.length > 0) {
            table.style.display = 'table';
        }

        if (error) {
            error.style.display = 'none';
        }


        // ========================================
        // เพิ่มจุดลงแผนที่
        // ========================================

        if (riskMap) {
            addRiskMarkers(reports);
        }

    } catch (err) {

        console.error('API Error:', err);

        if (loading) {
            loading.style.display = 'none';
        }

        if (error) {

            error.textContent =
                'ไม่สามารถโหลดข้อมูลจาก Backend ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่';

            error.style.display = 'block';
        }
    }
}


// ========================================
// ระดับความเสี่ยง
// ========================================

function getRiskClass(level) {

    if (level === 'สูง') {
        return 'high-risk';
    }

    if (level === 'ปานกลาง') {
        return 'medium-risk';
    }

    if (level === 'ต่ำ') {
        return 'low-risk';
    }

    return '';
}


// ========================================
// สีของจุดบนแผนที่
// ========================================

function getMarkerColor(level) {

    if (level === 'สูง') {
        return '#dc2626';
    }

    if (level === 'ปานกลาง') {
        return '#f59e0b';
    }

    return '#16a34a';
}


// ========================================
// สร้างแผนที่
// ========================================

function initMap() {

    const mapElement =
        document.getElementById('riskMap');

    // ถ้าหน้านี้ไม่มีแผนที่ ไม่ต้องทำอะไร
    if (!mapElement) {
        return;
    }

    if (typeof L === 'undefined') {

        console.warn(
            'Leaflet ยังไม่ถูกโหลด'
        );

        return;
    }

    riskMap = L.map('riskMap').setView(
        [13.7563, 100.5018],
        10
    );

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(riskMap);

    console.log(
        'สร้างแผนที่เรียบร้อยแล้ว'
    );
}


// ========================================
// เพิ่มจุดพื้นที่เสี่ยง
// ========================================

function addRiskMarkers(reports) {

    if (!riskMap) {
        return;
    }

    reports.forEach(report => {

        const latitude =
            Number(report.latitude);

        const longitude =
            Number(report.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude === 0 ||
            longitude === 0
        ) {

            console.warn(
                'ไม่พบพิกัดของพื้นที่:',
                report.area
            );

            return;
        }

        const color =
            getMarkerColor(report.riskLevel);

        const marker = L.circleMarker(
            [latitude, longitude],
            {
                radius: 10,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85
            }
        ).addTo(riskMap);

        marker.bindPopup(`
            <div class="map-popup">

                <h3>${report.area}</h3>

                <p>
                    <strong>ระดับความเสี่ยง:</strong>
                    ${report.riskLevel}
                </p>

                <p>
                    <strong>จำนวนผู้ป่วย:</strong>
                    ${report.cases} ราย
                </p>

                <p>
                    <strong>รายละเอียด:</strong>
                    ${report.description || '-'}
                </p>

            </div>
        `);

    });
}


// ========================================
// เริ่มต้น Frontend
// ========================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        console.log(
            'Frontend เริ่มทำงาน'
        );

        console.log(
            'API URL:',
            API_URL
        );

        initMap();

        loadReports();

    }
);


// ========================================
// REGISTER SERVICE WORKER
// ========================================

if ('serviceWorker' in navigator) {

    window.addEventListener(
        'load',
        async () => {

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

        }
    );

}


// ========================================
// PWA INSTALL
// ========================================

let deferredPrompt = null;

const installAppBtn =
    document.getElementById('installAppBtn');


// ========================================
// PWA พร้อมสำหรับติดตั้ง
// ========================================

window.addEventListener(
    'beforeinstallprompt',
    event => {

        event.preventDefault();

        deferredPrompt = event;

        console.log(
            'PWA พร้อมสำหรับการติดตั้ง'
        );

        if (installAppBtn) {
            installAppBtn.style.display = 'block';
        }

    }
);


// ========================================
// กดปุ่มติดตั้ง
// ========================================

if (installAppBtn) {

    installAppBtn.addEventListener(
        'click',
        async () => {

            if (!deferredPrompt) {

                console.log(
                    'ยังไม่มี Install Prompt'
                );

                return;
            }

            deferredPrompt.prompt();

            const result =
                await deferredPrompt.userChoice;

            console.log(
                'Install result:',
                result.outcome
            );

            deferredPrompt = null;

            installAppBtn.style.display = 'none';

        }
    );

}


// ========================================
// ติดตั้งแอปสำเร็จ
// ========================================

window.addEventListener(
    'appinstalled',
    () => {

        console.log(
            'Dengue Watch installed successfully'
        );

        deferredPrompt = null;

        if (installAppBtn) {
            installAppBtn.style.display = 'none';
        }

    }
);