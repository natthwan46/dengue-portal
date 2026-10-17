
const $ = id => document.getElementById(id);
let records = [];

function dateLabel(value) {
  return new Date(value).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok",
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function localInput(iso) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(iso));

  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

function bangkokISO(value) {
  return new Date(value + ":00+07:00").toISOString();
}

function clearForm() {
  $("form").reset();
  $("id").value = "";
  $("formTitle").textContent = "เพิ่มกำหนดการพ่นสารเคมี";
}

function addCell(tr, value) {
  const td = document.createElement("td");
  td.textContent = value ?? "-";
  tr.appendChild(td);
  return td;
}

async function load() {
  try {
    const res = await fetch("/api/spraying", {
      cache: "no-store"
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || "โหลดข้อมูลไม่สำเร็จ");
    }

    records = json.data || [];
    $("rows").replaceChildren();

    for (const item of records) {
      const tr = document.createElement("tr");

      [
        item.district,
        item.location,
        dateLabel(item.scheduledAt),
        item.status
      ].forEach(value => addCell(tr, value));

      const actions = addCell(tr, "");

      const edit = document.createElement("button");
      edit.textContent = "แก้ไข";
      edit.onclick = () => {
        ["id", "district", "location", "status", "notes"]
          .forEach(field => {
            $(field).value = item[field] ?? "";
          });

        $("scheduledAt").value = localInput(item.scheduledAt);
        $("formTitle").textContent = `แก้ไขรายการ #${item.id}`;
        window.scrollTo(0, 0);
      };

      const del = document.createElement("button");
      del.textContent = "ลบ";
      del.className = "danger";
      del.onclick = () => remove(item.id);

      actions.append(edit, document.createTextNode(" "), del);
      $("rows").appendChild(tr);
    }

  } catch (error) {
    $("message").textContent = error.message;
  }
}

async function apiRequest(url, method, body) {
  const key = $("key").value;

  if (!key) {
    throw new Error("กรุณากรอก Admin API Key");
  }

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "ดำเนินการไม่สำเร็จ");
  }

  return json;
}

$("form").onsubmit = async event => {
  event.preventDefault();

  try {
    const id = $("id").value;

    const payload = {
      district: $("district").value,
      location: $("location").value,
      scheduledAt: bangkokISO($("scheduledAt").value),
      status: $("status").value,
      notes: $("notes").value
    };

    await apiRequest(
      id ? `/api/spraying/${id}` : "/api/spraying",
      id ? "PUT" : "POST",
      payload
    );

    $("message").textContent = "บันทึกข้อมูลสำเร็จ";
    clearForm();
    await load();

  } catch (error) {
    $("message").textContent = error.message;
  }
};

async function remove(id) {
  if (!confirm("ยืนยันการลบรายการนี้?")) return;

  try {
    await apiRequest(`/api/spraying/${id}`, "DELETE");
    $("message").textContent = "ลบข้อมูลสำเร็จ";
    await load();
  } catch (error) {
    $("message").textContent = error.message;
  }
}

$("clear").onclick = clearForm;
$("reload").onclick = load;

load();
