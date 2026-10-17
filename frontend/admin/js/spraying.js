<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>แอดมิน - ตารางพ่นสารเคมี</title>
  <link rel="stylesheet" href="../css/spraying.css">
</head>
<body>
  <header>
    <h1>จัดการตารางพ่นสารเคมีกำจัดยุง</h1>
    <a href="../spraying.html">← หน้าผู้ใช้งาน</a>
  </header>

  <main>
    <section>
      <h2>ยืนยันสิทธิ์เจ้าหน้าที่</h2>
      <p class="hint">
        ระบบ API Key นี้ใช้สำหรับทดสอบเท่านั้น
        ก่อนใช้งานจริงต้องเพิ่มระบบล็อกอินที่ปลอดภัย
      </p>
      <label>Admin API Key
        <input type="password" id="key"
          autocomplete="off" placeholder="รหัส API Key">
      </label>
    </section>

    <section>
      <h2 id="formTitle">เพิ่มกำหนดการพ่นสารเคมี</h2>

      <form id="form">
        <input type="hidden" id="id">

        <label>เขต
          <input id="district" required maxlength="120"
            placeholder="เช่น เขตบางกะปิ">
        </label>

        <label>พื้นที่ / สถานที่
          <input id="location" required maxlength="250"
            placeholder="เช่น ชุมชนคลองจั่น">
        </label>

        <label>วันและเวลา
          <input type="datetime-local"
            id="scheduledAt" required>
        </label>

        <label>สถานะ
          <select id="status">
            <option value="scheduled">รอดำเนินการ</option>
            <option value="completed">ดำเนินการแล้ว</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </label>

        <label>หมายเหตุ
          <textarea id="notes" rows="3"></textarea>
        </label>

        <div class="actions">
          <button type="submit">บันทึกข้อมูล</button>
          <button type="button" id="clear" class="secondary">
            ล้างแบบฟอร์ม
          </button>
        </div>
      </form>

      <p id="message" role="status"></p>
    </section>

    <section>
      <h2>รายการนัดหมายทั้งหมด</h2>
      <button id="reload">รีเฟรชข้อมูล</button>

      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th>เขต</th>
              <th>สถานที่</th>
              <th>วันเวลา</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
    </section>
  </main>

  <script src="../js/spraying-admin.js"></script>
</body>
</html>
