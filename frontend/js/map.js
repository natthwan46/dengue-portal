const API_BASE =
  `http://${window.location.hostname}:5000`;

const API_URL =
  `${API_BASE}/api/reports`;

// ===============================
// สร้างแผนที่
// ===============================

const map = L.map('riskMap').setView(
  [13.7563, 100.5018],
  10
);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }
).addTo(map);


// ===============================
// ตัวแปร
// ===============================

let allReports = [];
let markers = [];


// ===============================
// โหลดข้อมูลจาก Backend
// ===============================

async function loadReports() {

  const areaList = document.getElementById('areaList');
  const areaCount = document.getElementById('areaCount');

  try {

    areaList.innerHTML = `
      <div class="loading-data">
        กำลังโหลดข้อมูล...
      </div>
    `;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('ไม่สามารถเชื่อมต่อ Backend ได้');
    }

    const result = await response.json();

    console.log('ข้อมูลจาก API:', result);

    allReports = result.data || [];

    displayReports(allReports);

  } catch (error) {

    console.error('API ERROR:', error);

    areaList.innerHTML = `
      <div class="error-data">
        ไม่สามารถโหลดข้อมูลได้
      </div>
    `;

    areaCount.textContent = '0 พื้นที่';
  }
}


// ===============================
// แสดงข้อมูล
// ===============================

function displayReports(reports) {

  const areaList = document.getElementById('areaList');
  const areaCount = document.getElementById('areaCount');

  areaList.innerHTML = '';

  areaCount.textContent = `${reports.length} พื้นที่`;


  // ลบ Marker เดิม
  markers.forEach(marker => {
    map.removeLayer(marker);
  });

  markers = [];


  // ไม่มีข้อมูล
  if (reports.length === 0) {

    areaList.innerHTML = `
      <div class="no-data">
        ไม่พบข้อมูลพื้นที่
      </div>
    `;

    return;
  }


  // ===============================
  // วนข้อมูลแต่ละพื้นที่
  // ===============================

  reports.forEach(report => {

    // -------------------------------
    // สร้างรายการพื้นที่
    // -------------------------------

    const item = document.createElement('div');

    item.className = 'area-item';

    item.innerHTML = `
      <div class="area-name">
        ${report.area}
      </div>

      <div class="area-info">

        <span class="case-count">
          ผู้ป่วย ${report.cases} ราย
        </span>

        <span class="risk-badge ${getRiskClass(report.riskLevel)}">
          ${report.riskLevel}
        </span>

      </div>
    `;

    areaList.appendChild(item);


    // -------------------------------
    // อ่านพิกัด
    // -------------------------------

    const latitude = parseFloat(report.latitude);
    const longitude = parseFloat(report.longitude);

    console.log(
      report.area,
      'latitude =',
      report.latitude,
      'longitude =',
      report.longitude
    );


    // -------------------------------
    // ตรวจสอบพิกัด
    // -------------------------------

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {

      const color = getRiskColor(report.riskLevel);


      // ===============================
      // สร้างจุดบนแผนที่
      // ===============================

      const marker = L.circleMarker(
        [latitude, longitude],
        {
          radius: 13,

          // ขอบ
          color: '#ffffff',
          weight: 3,

          // สีจุด
          fillColor: color,
          fillOpacity: 1
        }
      );

      marker.addTo(map);


      // Popup
      marker.bindPopup(`
        <div style="min-width:180px">

          <strong style="font-size:16px">
            ${report.area}
          </strong>

          <hr style="
            border:0;
            border-top:1px solid #ddd;
            margin:8px 0;
          ">

          <div>
            ระดับความเสี่ยง:
            <strong style="color:${color}">
              ${report.riskLevel}
            </strong>
          </div>

          <div>
            จำนวนผู้ป่วย:
            <strong>
              ${report.cases} ราย
            </strong>
          </div>

          ${report.description
          ? `
                <div style="margin-top:7px">
                  ${report.description}
                </div>
              `
          : ''
        }

        </div>
      `);


      // เก็บ Marker
      markers.push(marker);


      // -------------------------------
      // คลิกรายการพื้นที่
      // -------------------------------

      item.addEventListener('click', () => {

        map.setView(
          [latitude, longitude],
          15
        );

        marker.openPopup();

      });

    } else {

      console.warn(
        `ไม่มีพิกัด: ${report.area}`,
        report.latitude,
        report.longitude
      );

      item.addEventListener('click', () => {

        alert(
          `${report.area} ยังไม่มีข้อมูลพิกัด`
        );

      });

    }

  });


  // ===============================
  // Zoom ให้เห็นทุก Marker
  // ===============================

  if (markers.length > 0) {

    const group = L.featureGroup(markers);

    map.fitBounds(
      group.getBounds(),
      {
        padding: [50, 50],
        maxZoom: 12
      }
    );

  } else {

    console.warn(
      'ไม่พบ Marker เพราะข้อมูลไม่มี latitude / longitude'
    );
  }
}


// ===============================
// สีของจุด
// ===============================

function getRiskColor(level) {

  // สูง = แดง
  if (level === 'สูง') {
    return '#dc2626';
  }

  // ปานกลาง = เหลือง
  if (level === 'ปานกลาง') {
    return '#facc15';
  }

  // ต่ำ = เขียว
  if (level === 'ต่ำ') {
    return '#16a34a';
  }

  return '#64748b';
}


// ===============================
// สี Badge
// ===============================

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


// ===============================
// Filter
// ===============================

const riskFilter =
  document.getElementById('riskFilter');

riskFilter.addEventListener(
  'change',
  function () {

    const selectedRisk = this.value;

    if (
      selectedRisk === 'ทั้งหมด' ||
      selectedRisk === 'all'
    ) {

      displayReports(allReports);

      return;
    }

    const filteredReports =
      allReports.filter(report => {
        return report.riskLevel === selectedRisk;
      });

    displayReports(filteredReports);
  }
);


// ===============================
// โหลดข้อมูล
// ===============================

loadReports();


// ===============================
// Refresh Map
// ===============================

setTimeout(() => {

  map.invalidateSize();

}, 300);