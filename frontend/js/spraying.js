
const month = document.getElementById("month");
const district = document.getElementById("district");
const rows = document.getElementById("rows");
const stats = document.getElementById("stats");
const message = document.getElementById("message");

const now = new Date();
month.value = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit"
}).format(now).slice(0, 7);

let records = [];

const statusNames = {
  scheduled: "รอดำเนินการ",
  completed: "ดำเนินการแล้ว",
  cancelled: "ยกเลิก"
};

function thaiDate(value) {
  return new Date(value).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function addCell(tr, value) {
  const td = document.createElement("td");
  td.textContent = value ?? "-";
  tr.appendChild(td);
}

function displayReports() {
  rows.replaceChildren();
  stats.replaceChildren();

  const filtered = records.filter(item =>
    !district.value || item.district === district.value
  );

  const counts = {};

  filtered.forEach(item => {
    if (item.status !== "cancelled") {
      counts[item.district] =
        (counts[item.district] || 0) + 1;
    }

    const tr = document.createElement("tr");

    [
      item.district,
      item.location,
      thaiDate(item.scheduledAt),
      statusNames[item.status] || item.status,
      item.notes
    ].forEach(value => addCell(tr, value));

    rows.appendChild(tr);
  });

  Object.entries(counts).forEach(([name, count]) => {
    const card = document.createElement("div");
    card.className = "stat";
    card.textContent = `${name}: ${count} ครั้ง/เดือน`;
    stats.appendChild(card);
  });

  message.textContent = filtered.length
    ? `พบ ${filtered.length} รายการ`
    : "ไม่พบกำหนดการในเดือนและเขตที่เลือก";
}

async function loadReports() {
  message.className = "";
  message.textContent = "กำลังโหลดข้อมูล...";

  try {
    const response = await fetch(
      `/api/spraying?month=${encodeURIComponent(month.value)}`,
      { cache: "no-store" }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "โหลดข้อมูลไม่สำเร็จ");
    }

    records = result.data || [];

    const selected = district.value;
    district.replaceChildren(new Option("ทุกเขต", ""));

    const districts = [
      ...new Set(records.map(item => item.district))
    ].sort();

    districts.forEach(name => {
      district.add(new Option(name, name));
    });

    district.value = selected;
    displayReports();

  } catch (error) {
    records = [];
    rows.replaceChildren();
    stats.replaceChildren();
    message.className = "error";
    message.textContent = error.message;
  }
}

month.addEventListener("change", loadReports);
district.addEventListener("change", displayReports);
document.getElementById("reload")
  .addEventListener("click", loadReports);

loadReports();
