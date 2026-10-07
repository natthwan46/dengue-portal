// ==========================================
// ELEMENTS
// ==========================================

const loginForm =
  document.getElementById('loginForm');

const usernameInput =
  document.getElementById('username');

const passwordInput =
  document.getElementById('password');

const loginError =
  document.getElementById('loginError');

const togglePassword =
  document.getElementById('togglePassword');


// ==========================================
// ถ้า Login อยู่แล้ว
// ให้ไปหน้า Admin
// ==========================================

if (
  sessionStorage.getItem('adminLoggedIn') === 'true'
) {

  window.location.href = './index.html';

}


// ==========================================
// แสดง / ซ่อน Password
// ==========================================

togglePassword.addEventListener(
  'click',
  function () {

    if (
      passwordInput.type === 'password'
    ) {

      passwordInput.type = 'text';

      togglePassword.textContent = '🙈';

    } else {

      passwordInput.type = 'password';

      togglePassword.textContent = '👁';

    }

  }
);


// ==========================================
// เมื่อเริ่มพิมพ์ใหม่ ให้ซ่อน Error
// ==========================================

usernameInput.addEventListener(
  'input',
  hideError
);


passwordInput.addEventListener(
  'input',
  hideError
);


function hideError() {

  loginError.style.display =
    'none';

  loginError.textContent =
    '';

}


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener(
  'submit',
  function (event) {

    event.preventDefault();


    const username =
      usernameInput.value.trim();

    const password =
      passwordInput.value;


    // ตรวจสอบช่องว่าง
    if (
      username === '' ||
      password === ''
    ) {

      showError(
        'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน'
      );

      return;

    }


    // ======================================
    // DEMO ACCOUNT
    // ใช้สำหรับทดสอบโครงงานเท่านั้น
    // ======================================

    const ADMIN_USERNAME =
      'admin';

    const ADMIN_PASSWORD =
      '1234';


    if (
      username === ADMIN_USERNAME &&
      password === ADMIN_PASSWORD
    ) {

      // บันทึกสถานะ Login
      sessionStorage.setItem(
        'adminLoggedIn',
        'true'
      );


      // บันทึกชื่อผู้ใช้งาน
      sessionStorage.setItem(
        'adminUsername',
        username
      );


      // ไปหน้า Admin Dashboard
      window.location.href =
        './index.html';

    } else {

      showError(
        'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง'
      );

    }

  }
);


// ==========================================
// ERROR
// ==========================================

function showError(message) {

  loginError.textContent =
    message;

  loginError.style.display =
    'block';

}