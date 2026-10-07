const API_BASE =
  `http://${window.location.hostname}:5000`;

const API_URL =
  `${API_BASE}/api/reports`;


// ==========================================
// โหลดข้อมูลระบาดวิทยา
// ==========================================

async function loadEpidemiology() {

  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const table = document.getElementById('epiTable');
  const tableBody = document.getElementById('epiTableBody');

  loading.style.display = 'block';
  error.textContent = '';
  table.style.display = 'none';

  try {

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('ไม่สามารถเชื่อมต่อ API ได้');
    }

    const result = await response.json();

    const reports = result.data || [];


    // ==========================================
    // สรุปข้อมูล
    // ==========================================

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


    document.getElementById('totalCases').textContent =
      totalCases;

    document.getElementById('highRisk').textContent =
      highRisk;

    document.getElementById('mediumRisk').textContent =
      mediumRisk;

    document.getElementById('lowRisk').textContent =
      lowRisk;


    // ==========================================
    // เปอร์เซ็นต์ระดับความเสี่ยง
    // ==========================================

    const totalAreas = reports.length;

    if (totalAreas > 0) {

      document.getElementById(
        'riskHighPercent'
      ).textContent =
        Math.round(
          (highRisk / totalAreas) * 100
        ) + '%';


      document.getElementById(
        'riskMediumPercent'
      ).textContent =
        Math.round(
          (mediumRisk / totalAreas) * 100
        ) + '%';


      document.getElementById(
        'riskLowPercent'
      ).textContent =
        Math.round(
          (lowRisk / totalAreas) * 100
        ) + '%';

    } else {

      document.getElementById(
        'riskHighPercent'
      ).textContent = '0%';

      document.getElementById(
        'riskMediumPercent'
      ).textContent = '0%';

      document.getElementById(
        'riskLowPercent'
      ).textContent = '0%';
    }


    // ==========================================
    // ตารางข้อมูล
    // ==========================================

    tableBody.innerHTML = '';

    reports.forEach((report, index) => {

      const row =
        document.createElement('tr');

      row.innerHTML = `
        <td>
          ${index + 1}
        </td>

        <td>
          <strong>
            ${report.area}
          </strong>
        </td>

        <td>
          <span
            class="risk-badge ${getRiskClass(report.riskLevel)}"
          >
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

      tableBody.appendChild(row);
    });


    // ==========================================
    // Alert
    // ==========================================

    createAlerts(reports);


    // ==========================================
    // Chart
    // ==========================================

    createChart(reports);


    // ==========================================
    // เวลาอัปเดต
    // ==========================================

    document.getElementById(
      'updateTime'
    ).textContent =
      'อัปเดตล่าสุด: ' +
      new Date().toLocaleString('th-TH');


    loading.style.display = 'none';
    table.style.display = 'table';


  } catch (err) {

    console.error('Epidemiology Error:', err);

    loading.style.display = 'none';

    error.textContent =
      'ไม่สามารถโหลดข้อมูลจาก Backend ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่';
  }
}


// ==========================================
// Risk Class
// ==========================================

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


// ==========================================
// Alerts
// ==========================================

function createAlerts(reports) {

  const alertList =
    document.getElementById('alertList');


  const highRisk = reports
    .filter(
      report =>
        report.riskLevel === 'สูง'
    )
    .sort(
      (a, b) =>
        Number(b.cases) -
        Number(a.cases)
    );


  if (highRisk.length === 0) {

    alertList.innerHTML = `
      <div class="no-alert">
        ไม่พบพื้นที่เสี่ยงสูงในขณะนี้
      </div>
    `;

    return;
  }


  alertList.innerHTML = '';


  highRisk.forEach(report => {

    const item =
      document.createElement('div');

    item.className = 'alert-item';

    item.innerHTML = `
      <div>
        🚨
        <strong>
          ${report.area}
        </strong>

        พบผู้ป่วย
        <strong>
          ${report.cases} ราย
        </strong>
      </div>

      <small>
        ${report.description || ''}
      </small>
    `;

    alertList.appendChild(item);
  });
}


// ==========================================
// สร้างกราฟ
// ==========================================

function createChart(reports) {

  const chart =
    document.getElementById('barChart');

  chart.innerHTML = '';


  if (reports.length === 0) {

    chart.innerHTML = `
      <div class="chart-empty">
        ไม่พบข้อมูลสำหรับแสดงกราฟ
      </div>
    `;

    return;
  }


  // เรียงผู้ป่วยจากมากไปน้อย
  const sortedReports =
    [...reports].sort(
      (a, b) =>
        Number(b.cases) -
        Number(a.cases)
    );


  const maxCases = Math.max(
    ...sortedReports.map(
      report =>
        Number(report.cases || 0)
    )
  );


  sortedReports.forEach(report => {

    const item =
      document.createElement('div');

    item.className = 'bar-item';


    const cases =
      Number(report.cases || 0);


    // ความสูงแท่งสูงสุด 220px
    const height =
      maxCases > 0
        ? Math.max(
          (cases / maxCases) * 220,
          10
        )
        : 10;


    const color =
      getChartColor(
        report.riskLevel
      );


    item.innerHTML = `

      <div class="bar-number">
        ${cases}
        <span>ราย</span>
      </div>


      <div class="bar-track">

        <div
          class="bar"
          style="
            height:${height}px;
            background-color:${color};
          "
          title="${report.area} : ${cases} ราย"
        >
        </div>

      </div>


      <div class="bar-label">
        ${report.area.replace('ตำบล', '')}
      </div>


      <div
        class="bar-risk"
        style="color:${color};"
      >
        ${getRiskText(report.riskLevel)}
      </div>

    `;


    chart.appendChild(item);
  });
}


// ==========================================
// สีกราฟตามระดับความเสี่ยง
// ==========================================

function getChartColor(level) {

  // เสี่ยงสูง = แดง
  if (level === 'สูง') {
    return '#dc2626';
  }

  // ปานกลาง = เหลือง/ส้ม
  if (level === 'ปานกลาง') {
    return '#f59e0b';
  }

  // เสี่ยงต่ำ = เขียว
  if (level === 'ต่ำ') {
    return '#16a34a';
  }

  return '#64748b';
}


// ==========================================
// ข้อความระดับความเสี่ยง
// ==========================================

function getRiskText(level) {

  if (level === 'สูง') {
    return 'เสี่ยงสูง';
  }

  if (level === 'ปานกลาง') {
    return 'ปานกลาง';
  }

  if (level === 'ต่ำ') {
    return 'เสี่ยงต่ำ';
  }

  return level;
}


// ==========================================
// โหลดข้อมูลทันที
// ==========================================

loadEpidemiology();