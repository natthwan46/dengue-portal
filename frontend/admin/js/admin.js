// ==========================================
// ตรวจสอบการเข้าสู่ระบบ
// ==========================================

const isLoggedIn =
  sessionStorage.getItem('adminLoggedIn');

if (isLoggedIn !== 'true') {

  window.location.href =
    './login.html';

}


// ==========================================
// แสดงชื่อ Admin
// ==========================================

const adminUsername =
  sessionStorage.getItem('adminUsername');

const adminWelcome =
  document.getElementById('adminWelcome');

if (
  adminWelcome &&
  adminUsername
) {

  adminWelcome.textContent =
    `เข้าสู่ระบบในชื่อ ${adminUsername}`;

}


// ==========================================
// Logout
// ==========================================

function logoutAdmin() {

  sessionStorage.removeItem(
    'adminLoggedIn'
  );

  sessionStorage.removeItem(
    'adminUsername'
  );

  window.location.href =
    './login.html';

}