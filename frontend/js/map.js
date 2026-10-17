
/* ========================================
   DENGUE PORTAL - RISK MAP
   ระบบแผนที่พื้นที่เสี่ยงโรคไข้เลือดออก
   ======================================== */

// ========================================
// 1. API CONFIG
// ========================================

// ใส่ URL Backend จริงจาก Render
// ตัวอย่าง https://your-backend.onrender.com
const ONLINE_API = '';

// ใช้ Backend ในเครื่องเมื่อเปิดผ่าน HTTP
const LOCAL_API =
    `http://${window.location.hostname}:5000`;

// ใช้ Render เมื่อเปิดเว็บไซต์ผ่าน HTTPS
const API_BASE =
    window.location.protocol === 'https:'
        ? ONLINE_API
        : LOCAL_API;

const API_URL = `${API_BASE}/api/reports`;

// อัปเดตข้อมูลทุก 30 วินาที
const REFRESH_INTERVAL = 30000;


// ========================================
// 2. GLOBAL VARIABLES
// ========================================

let map = null;
let riskMarkerLayer = null;

let allReports = [];
let markers = [];

let refreshTimer = null;
let isRefreshing = false;
let hasLoadedOnce = false;


// ========================================
// 3. HELPER FUNCTIONS
// ========================================

// ป้องกัน HTML ที่ไม่ปลอดภัยจาก API
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

// ตรวจสอบพิกัด
function getCoordinates(report) {
    if (
        report.latitude == null ||
        report.longitude == null ||
        report.latitude === '' ||
        report.longitude === ''
    ) {
        return null;
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
        return null;
    }

    return [latitude, longitude];
}


// ========================================
// 4. RISK COLORS
// ========================================

function getRiskColor(level) {
    if (level === 'สูง') {
        return '#dc2626';
    }

    if (level === 'ปานกลาง') {
        return '#f59e0b';
    }

    if (level === 'ต่ำ') {
        return '#16a34a';
    }

    return '#64748b';
}


// ========================================
// 5. RISK BADGE CLASSES
// ========================================

function getRiskClass(level) {
    if (level === 'สูง') {
        return 'risk-high';
    }

    if (level === 'ปานกลาง') {
        return 'risk-medium';
    }

    if (level === 'ต่ำ') {
        return 'risk-low';
    }

    return '';
}


// ========================================
// 6. INITIALIZE MAP
// ========================================

function initMap() {
    const mapElement =
        document.getElementById('riskMap');

    if (!mapElement) {
        console.error('ไม่พบ Element #riskMap');
        return false;
    }

    if (typeof L === 'undefined') {
        console.error('Leaflet ยังไม่ถูกโหลด');
        return false;
    }

    if (map) {
        return true;
    }

    // ตำแหน่งเริ่มต้นกรุงเทพมหานคร
    map = L.map('riskMap', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView(
        [13.7563, 100.5018],
        10
    );

    // แผนที่ OpenStreetMap
    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);

    // ชั้นแสดงจุดพื้นที่เสี่ยง
    riskMarkerLayer =
        L.layerGroup().addTo(map);

    // ปรับขนาดแผนที่ให้เต็ม Container
    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    console.log('สร้างแผนที่สำเร็จ');

    return true;
}


// ========================================
// 7. UPDATE STATUS
// ========================================

function updateMapStatus(message, isError = false) {
    const status =
        document.getElementById('mapUpdateStatus');

    const lastUpdated =
        document.getElementById('lastUpdated');

    if (status) {
        status.classList.toggle(
            'is-error',
            isError
        );
    }

    if (lastUpdated) {
        lastUpdated.textContent = message;
    }
}

function showLastUpdated() {
    const now = new Date();

    const time = now.toLocaleTimeString(
        'th-TH',
        {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }
    );

    updateMapStatus(
        `อัปเดตล่าสุด: ${time}`,
        false
    );
}


// ========================================
// 8. LOADING / ERROR MESSAGES
// ========================================

function showAreaMessage(message, className) {
    const areaList =
        document.getElementById('areaList');

    if (!areaList) return;

    areaList.innerHTML = '';

    const element = document.createElement('div');

    element.className = className;
    element.textContent = message;

    areaList.appendChild(element);
}


// ========================================
// 9. LOAD DATA FROM BACKEND
// ========================================

async function loadReports() {
    // ป้องกันการเรียก API ซ้อนกัน
    if (isRefreshing) return;

    isRefreshing = true;

    try {
        if (!API_BASE) {
            throw new Error(
                'ยังไม่ได้กำหนด URL Backend บน Render'
            );
        }

        if (!hasLoadedOnce) {
            showAreaMessage(
                'กำลังโหลดข้อมูล...',
                'loading-data'
            );

            updateMapStatus(
                'กำลังโหลดข้อมูลล่าสุด...'
            );
        }

        console.log(
            'กำลังเชื่อมต่อ API:',
            API_URL
        );

        const response = await fetch(API_URL, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }

        const result = await response.json();

        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {
            throw new Error(
                result.message ||
                'รูปแบบข้อมูล API ไม่ถูกต้อง'
            );
        }

        // เก็บข้อมูลล่าสุด
        allReports = result.data;

        // แสดงตาม Filter ที่เลือกไว้
        applyRiskFilter({
            fitMap: !hasLoadedOnce
        });

        hasLoadedOnce = true;

        // แสดงเวลาอัปเดต
        showLastUpdated();

        console.log(
            'อัปเดตข้อมูลสำเร็จ:',
            allReports.length,
            'พื้นที่'
        );

    } catch (error) {
        console.error(
            'โหลดข้อมูลจาก Backend ไม่สำเร็จ:',
            error
        );

        updateMapStatus(
            'ไม่สามารถอัปเดตข้อมูลได้',
            true
        );

        // หากเคยโหลดสำเร็จแล้ว
        // ให้เก็บข้อมูลเดิมไว้
        if (!hasLoadedOnce) {
            showAreaMessage(
                'ไม่สามารถโหลดข้อมูลจาก Backend ได้',
                'error-data'
            );

            const areaCount =
                document.getElementById('areaCount');

            if (areaCount) {
                areaCount.textContent = '0 พื้นที่';
            }
        }

    } finally {
        isRefreshing = false;
    }
}


// ========================================
// 10. DISPLAY REPORTS
// ========================================

function displayReports(
    reports,
    options = {}
) {
    const areaList =
        document.getElementById('areaList');

    const areaCount =
        document.getElementById('areaCount');

    if (!areaList || !map || !riskMarkerLayer) {
        return;
    }

    const fitMap = options.fitMap === true;

    // ลบรายการเก่า
    areaList.innerHTML = '';

    // ลบ Marker เก่าทั้งหมด
    riskMarkerLayer.clearLayers();

    markers = [];

    // จำนวนพื้นที่
    if (areaCount) {
        areaCount.textContent =
            `${reports.length} พื้นที่`;
    }

    // กรณีไม่มีข้อมูล
    if (reports.length === 0) {
        showAreaMessage(
            'ไม่พบข้อมูลพื้นที่',
            'no-data'
        );

        return;
    }

    // ====================================
    // สร้างรายการและ Marker
    // ====================================

    reports.forEach(report => {
        const item =
            document.createElement('div');

        item.className = 'area-item';

        const color =
            getRiskColor(report.riskLevel);

        const riskClass =
            getRiskClass(report.riskLevel);

        const cases =
            Number(report.cases) || 0;

        const area =
            escapeHTML(report.area);

        const riskLevel =
            escapeHTML(report.riskLevel);

        const description =
            escapeHTML(report.description || '');

        // รายการพื้นที่ด้านข้าง
        item.innerHTML = `
            <div class="area-name">
                ${area}
            </div>

            <div class="area-info">
                <span class="case-count">
                    ผู้ป่วย ${cases} ราย
                </span>

                <span class="risk-badge ${riskClass}">
                    ${riskLevel}
                </span>
            </div>
        `;

        areaList.appendChild(item);

        // ตรวจสอบพิกัด
        const coordinates =
            getCoordinates(report);

        if (!coordinates) {
            console.warn(
                'ไม่มีพิกัดที่ถูกต้อง:',
                report.area
            );

            item.addEventListener(
                'click',
                () => {
                    alert(
                        `${report.area} ยังไม่มีข้อมูลพิกัด`
                    );
                }
            );

            return;
        }

        const [latitude, longitude] =
            coordinates;

        // ====================================
        // สร้าง Marker
        // ====================================

        const marker = L.circleMarker(
            [latitude, longitude],
            {
                radius: 13,
                color: '#ffffff',
                weight: 3,
                opacity: 1,
                fillColor: color,
                fillOpacity: 0.9
            }
        );

        marker.addTo(riskMarkerLayer);

        // ====================================
        // Popup
        // ====================================

        marker.bindPopup(`
            <div style="min-width:180px">

                <strong style="font-size:16px">
                    ${area}
                </strong>

                <hr style="
                    border:0;
                    border-top:1px solid #ddd;
                    margin:8px 0;
                ">

                <div>
                    ระดับความเสี่ยง:
                    <strong style="color:${color}">
                        ${riskLevel}
                    </strong>
                </div>

                <div style="margin-top:5px">
                    จำนวนผู้ป่วย:
                    <strong>
                        ${cases} ราย
                    </strong>
                </div>

                ${
                    description
                        ? `
                            <div style="margin-top:7px">
                                ${description}
                            </div>
                        `
                        : ''
                }

                <div style="
                    margin-top:8px;
                    color:#64748b;
                    font-size:10px;
                ">
                    ข้อมูลจำลองสำหรับทดสอบระบบ
                </div>

            </div>
        `);

        // เก็บ Marker
        markers.push(marker);

        // ====================================
        // คลิกพื้นที่เพื่อซูม
        // ====================================

        item.addEventListener(
            'click',
            () => {
                map.setView(
                    [latitude, longitude],
                    15,
                    {
                        animate: true
                    }
                );

                marker.openPopup();
            }
        );
    });

    // ====================================
    // Zoom ให้เห็นทุกพื้นที่ครั้งแรก
    // ไม่ Zoom ซ้ำทุก 30 วินาที
    // ====================================

    if (fitMap && markers.length > 0) {
        const group =
            L.featureGroup(markers);

        map.fitBounds(
            group.getBounds(),
            {
                padding: [50, 50],
                maxZoom: 12
            }
        );
    }

    console.log(
        'แสดง Marker:',
        markers.length,
        'จุด'
    );
}


// ========================================
// 11. RISK FILTER
// ========================================

function applyRiskFilter(options = {}) {
    const riskFilter =
        document.getElementById('riskFilter');

    const selectedRisk =
        riskFilter ? riskFilter.value : 'all';

    let filteredReports = allReports;

    if (
        selectedRisk !== 'ทั้งหมด' &&
        selectedRisk !== 'all' &&
        selectedRisk !== ''
    ) {
        filteredReports = allReports.filter(
            report =>
                report.riskLevel === selectedRisk
        );
    }

    displayReports(
        filteredReports,
        options
    );
}


// ========================================
// 12. AUTO REFRESH
// ========================================

function startAutoRefresh() {
    // ป้องกัน Timer ซ้ำ
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

    console.log(
        'เปิด Auto Refresh ทุก 30 วินาที'
    );
}


// ========================================
// 13. PAGE VISIBILITY
// ========================================

// เมื่อกลับมาที่หน้าเว็บ
// ให้ตรวจสอบข้อมูลใหม่ทันที
document.addEventListener(
    'visibilitychange',
    () => {
        if (!document.hidden && map) {
            loadReports();
        }
    }
);


// ========================================
// 14. INITIALIZE APPLICATION
// ========================================

document.addEventListener(
    'DOMContentLoaded',
    () => {
        console.log(
            'เริ่มระบบแผนที่ Dengue Portal'
        );

        // สร้างแผนที่
        const mapReady = initMap();

        if (!mapReady) {
            return;
        }

        // เปิดระบบ Filter
        const riskFilter =
            document.getElementById('riskFilter');

        if (riskFilter) {
            riskFilter.addEventListener(
                'change',
                () => {
                    applyRiskFilter({
                        fitMap: true
                    });
                }
            );
        }

        // เริ่มอัปเดตอัตโนมัติ
        startAutoRefresh();

        // ปรับขนาดแผนที่
        window.addEventListener(
            'resize',
            () => {
                map.invalidateSize();
            }
        );
    }
);
