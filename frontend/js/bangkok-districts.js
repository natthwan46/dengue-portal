
/* ==========================================
   BANGKOK DISTRICTS - 50 DISTRICTS
   ใช้ร่วมกันทุกหน้าใน Dengue Portal
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

/* จัดรูปแบบชื่อเขต */
function normalizeDistrict(value) {
  return String(value ?? "")
    .trim()
    .replace(/^เขต/, "")
    .trim();
}

/* เติมรายชื่อ 50 เขตลงใน select */
function populateDistrictSelect(selectId, allOption = true) {
  const select = document.getElementById(selectId);

  if (!select) return;

  const previousValue = normalizeDistrict(select.value);

  select.replaceChildren();

  if (allOption) {
    select.add(new Option("ทุกเขตในกรุงเทพมหานคร", ""));
  } else {
    select.add(new Option("กรุณาเลือกเขต", ""));
  }

  BANGKOK_DISTRICTS.forEach((name) => {
    select.add(new Option(`เขต${name}`, name));
  });

  if (BANGKOK_DISTRICTS.includes(previousValue)) {
    select.value = previousValue;
  }
}

/* กรองข้อมูลตามเขต */
function filterByDistrict(reports, selectedDistrict) {
  if (!selectedDistrict) return reports;

  return reports.filter((report) => {
    return normalizeDistrict(report.district) ===
      normalizeDistrict(selectedDistrict);
  });
}
