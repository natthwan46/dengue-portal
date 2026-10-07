const API_BASE =
  `http://${window.location.hostname}:5000`;

const API_URL =
  `${API_BASE}/api/reports`;


let allReports = [];

let deleteReportId = null;


// ==========================================
// ตรวจสอบ Admin Login
// ==========================================

if (
  sessionStorage.getItem('adminLoggedIn') !== 'true'
) {

  window.location.href =
    './login.html';

}


// ==========================================
// Elements
// ==========================================

const reportTableBody =
  document.getElementById('reportTableBody');

const loading =
  document.getElementById('loading');

const emptyData =
  document.getElementById('emptyData');

const message =
  document.getElementById('message');


const reportModal =
  document.getElementById('reportModal');

const deleteModal =
  document.getElementById('deleteModal');


const reportForm =
  document.getElementById('reportForm');

const modalTitle =
  document.getElementById('modalTitle');


const searchInput =
  document.getElementById('searchInput');

const riskFilter =
  document.getElementById('riskFilter');


// ==========================================
// LOAD REPORTS
// ==========================================

async function loadReports() {

  loading.style.display = 'block';

  emptyData.style.display = 'none';


  try {

    const response =
      await fetch(API_URL);


    if (!response.ok) {

      throw new Error(
        'ไม่สามารถโหลดข้อมูลได้'
      );

    }


    const result =
      await response.json();


    allReports =
      result.data || [];


    updateSummary(allReports);

    filterReports();


  } catch (error) {

    console.error(error);

    showMessage(
      'ไม่สามารถเชื่อมต่อ Backend ได้',
      'error'
    );

  } finally {

    loading.style.display =
      'none';

  }

}


// ==========================================
// SUMMARY
// ==========================================

function updateSummary(reports) {

  const high =
    reports.filter(
      report =>
        report.riskLevel === 'สูง'
    ).length;


  const medium =
    reports.filter(
      report =>
        report.riskLevel === 'ปานกลาง'
    ).length;


  const low =
    reports.filter(
      report =>
        report.riskLevel === 'ต่ำ'
    ).length;


  document.getElementById(
    'totalAreas'
  ).textContent =
    reports.length;


  document.getElementById(
    'highAreas'
  ).textContent =
    high;


  document.getElementById(
    'mediumAreas'
  ).textContent =
    medium;


  document.getElementById(
    'lowAreas'
  ).textContent =
    low;

}


// ==========================================
// DISPLAY TABLE
// ==========================================

function displayReports(reports) {

  reportTableBody.innerHTML =
    '';


  if (reports.length === 0) {

    emptyData.style.display =
      'block';

    return;

  }


  emptyData.style.display =
    'none';


  reports.forEach(
    (report, index) => {

      const row =
        document.createElement('tr');


      const latitude =
        report.latitude ?? '-';

      const longitude =
        report.longitude ?? '-';


      row.innerHTML = `
        <td>
          ${index + 1}
        </td>

        <td>
          <strong>
            ${escapeHTML(report.area)}
          </strong>
        </td>

        <td>
          <span
            class="
              risk-badge
              ${getRiskClass(report.riskLevel)}
            "
          >
            ${escapeHTML(report.riskLevel)}
          </span>
        </td>

        <td>
          ${Number(report.cases || 0)} ราย
        </td>

        <td>
          <small>
            ${latitude}<br>
            ${longitude}
          </small>
        </td>

        <td>
          ${escapeHTML(report.description || '-')}
        </td>

        <td>

          <div class="table-actions">

            <button
              type="button"
              class="edit-button"
              data-id="${report.id}"
            >
              ✏️ แก้ไข
            </button>

            <button
              type="button"
              class="delete-small-button"
              data-id="${report.id}"
            >
              🗑️ ลบ
            </button>

          </div>

        </td>
      `;


      row
        .querySelector('.edit-button')
        .addEventListener(
          'click',
          () => openEditModal(report.id)
        );


      row
        .querySelector('.delete-small-button')
        .addEventListener(
          'click',
          () => openDeleteModal(report.id)
        );


      reportTableBody.appendChild(row);

    }
  );

}


// ==========================================
// FILTER
// ==========================================

function filterReports() {

  const keyword =
    searchInput.value
      .trim()
      .toLowerCase();


  const selectedRisk =
    riskFilter.value;


  const filtered =
    allReports.filter(
      report => {

        const area =
          String(report.area || '')
            .toLowerCase();


        const matchSearch =
          area.includes(keyword);


        const matchRisk =
          selectedRisk === 'all' ||
          report.riskLevel === selectedRisk;


        return (
          matchSearch &&
          matchRisk
        );

      }
    );


  displayReports(filtered);

}


// ==========================================
// ADD MODAL
// ==========================================

function openAddModal() {

  reportForm.reset();


  document.getElementById(
    'reportId'
  ).value = '';


  document.getElementById(
    'cases'
  ).value = 0;


  modalTitle.textContent =
    'เพิ่มข้อมูลพื้นที่';


  reportModal.classList.add(
    'show'
  );


  document.body.style.overflow =
    'hidden';

}


// ==========================================
// EDIT MODAL
// ==========================================

function openEditModal(id) {

  const report =
    allReports.find(
      item =>
        Number(item.id) === Number(id)
    );


  if (!report) {
    return;
  }


  document.getElementById(
    'reportId'
  ).value =
    report.id;


  document.getElementById(
    'area'
  ).value =
    report.area || '';


  document.getElementById(
    'riskLevel'
  ).value =
    report.riskLevel || '';


  document.getElementById(
    'cases'
  ).value =
    report.cases ?? 0;


  document.getElementById(
    'latitude'
  ).value =
    report.latitude ?? '';


  document.getElementById(
    'longitude'
  ).value =
    report.longitude ?? '';


  document.getElementById(
    'description'
  ).value =
    report.description || '';


  modalTitle.textContent =
    'แก้ไขข้อมูลพื้นที่';


  reportModal.classList.add(
    'show'
  );


  document.body.style.overflow =
    'hidden';

}


// ==========================================
// CLOSE REPORT MODAL
// ==========================================

function closeReportModal() {

  reportModal.classList.remove(
    'show'
  );

  document.body.style.overflow =
    '';

}


// ==========================================
// SAVE ADD / EDIT
// ==========================================

reportForm.addEventListener(
  'submit',
  async function (event) {

    event.preventDefault();


    const id =
      document.getElementById(
        'reportId'
      ).value;


    const latitudeValue =
      document.getElementById(
        'latitude'
      ).value.trim();


    const longitudeValue =
      document.getElementById(
        'longitude'
      ).value.trim();


    const data = {

      area:
        document.getElementById(
          'area'
        ).value.trim(),

      riskLevel:
        document.getElementById(
          'riskLevel'
        ).value,

      cases:
        Number(
          document.getElementById(
            'cases'
          ).value
        ),

      latitude:
        latitudeValue === ''
          ? null
          : Number(latitudeValue),

      longitude:
        longitudeValue === ''
          ? null
          : Number(longitudeValue),

      description:
        document.getElementById(
          'description'
        ).value.trim()

    };


    if (
      !data.area ||
      !data.riskLevel
    ) {

      showMessage(
        'กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
        'error'
      );

      return;

    }


    if (
      !Number.isInteger(data.cases) ||
      data.cases < 0
    ) {

      showMessage(
        'จำนวนผู้ป่วยต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป',
        'error'
      );

      return;

    }


    try {

      let response;


      // แก้ไข
      if (id) {

        response =
          await fetch(
            `${API_URL}/${id}`,
            {
              method: 'PUT',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify(data)
            }
          );

      }

      // เพิ่มใหม่
      else {

        response =
          await fetch(
            API_URL,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify(data)
            }
          );

      }


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'ไม่สามารถบันทึกข้อมูลได้'
        );

      }


      closeReportModal();


      showMessage(
        id
          ? 'แก้ไขข้อมูลเรียบร้อยแล้ว'
          : 'เพิ่มข้อมูลเรียบร้อยแล้ว',
        'success'
      );


      await loadReports();


    } catch (error) {

      console.error(error);

      showMessage(
        error.message,
        'error'
      );

    }

  }
);


// ==========================================
// DELETE MODAL
// ==========================================

function openDeleteModal(id) {

  const report =
    allReports.find(
      item =>
        Number(item.id) === Number(id)
    );


  if (!report) {
    return;
  }


  deleteReportId =
    report.id;


  document.getElementById(
    'deleteAreaName'
  ).textContent =
    report.area;


  deleteModal.classList.add(
    'show'
  );


  document.body.style.overflow =
    'hidden';

}


// ==========================================
// CLOSE DELETE
// ==========================================

function closeDeleteModal() {

  deleteReportId =
    null;


  deleteModal.classList.remove(
    'show'
  );


  document.body.style.overflow =
    '';

}


// ==========================================
// CONFIRM DELETE
// ==========================================

document.getElementById(
  'confirmDelete'
).addEventListener(
  'click',
  async function () {

    if (!deleteReportId) {
      return;
    }


    try {

      const response =
        await fetch(
          `${API_URL}/${deleteReportId}`,
          {
            method: 'DELETE'
          }
        );


      const result =
        await response.json();


      if (!response.ok) {

        throw new Error(
          result.message ||
          'ไม่สามารถลบข้อมูลได้'
        );

      }


      closeDeleteModal();


      showMessage(
        'ลบข้อมูลเรียบร้อยแล้ว',
        'success'
      );


      await loadReports();


    } catch (error) {

      console.error(error);

      showMessage(
        error.message,
        'error'
      );

    }

  }
);


// ==========================================
// RISK CLASS
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
// MESSAGE
// ==========================================

function showMessage(
  text,
  type
) {

  message.textContent =
    text;


  message.className =
    `message ${type}`;


  setTimeout(
    () => {

      message.className =
        'message';

      message.textContent =
        '';

    },
    3500
  );

}


// ==========================================
// ป้องกันข้อความจากฐานข้อมูล
// ถูกตีความเป็น HTML
// ==========================================

function escapeHTML(value) {

  const div =
    document.createElement('div');

  div.textContent =
    String(value ?? '');

  return div.innerHTML;

}


// ==========================================
// EVENTS
// ==========================================

document.getElementById(
  'addButton'
).addEventListener(
  'click',
  openAddModal
);


document.getElementById(
  'closeModal'
).addEventListener(
  'click',
  closeReportModal
);


document.getElementById(
  'cancelButton'
).addEventListener(
  'click',
  closeReportModal
);


document.getElementById(
  'cancelDelete'
).addEventListener(
  'click',
  closeDeleteModal
);


document.getElementById(
  'refreshButton'
).addEventListener(
  'click',
  loadReports
);


searchInput.addEventListener(
  'input',
  filterReports
);


riskFilter.addEventListener(
  'change',
  filterReports
);


// กดพื้นที่ด้านนอก Modal

reportModal.addEventListener(
  'click',
  function (event) {

    if (event.target === reportModal) {
      closeReportModal();
    }

  }
);


deleteModal.addEventListener(
  'click',
  function (event) {

    if (event.target === deleteModal) {
      closeDeleteModal();
    }

  }
);


// ESC

document.addEventListener(
  'keydown',
  function (event) {

    if (event.key === 'Escape') {

      closeReportModal();
      closeDeleteModal();

    }

  }
);


// ==========================================
// START
// ==========================================

loadReports();