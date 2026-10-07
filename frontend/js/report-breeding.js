const form = document.getElementById('breedingReportForm');

const imageInput = document.getElementById('reportImage');
const imagePreview = document.getElementById('imagePreview');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const removeImageButton = document.getElementById('removeImageButton');

const locationButton = document.getElementById('locationButton');
const locationResult = document.getElementById('locationResult');

const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');


/* ==============================
   แสดงตัวอย่างรูป
============================== */

imageInput.addEventListener('change', function () {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพ');
        imageInput.value = '';
        return;
    }

    const imageURL = URL.createObjectURL(file);

    imagePreview.src = imageURL;
    imagePreview.style.display = 'block';

    uploadPlaceholder.style.display = 'none';

    removeImageButton.style.display = 'inline-block';
});


/* ==============================
   ลบรูป
============================== */

removeImageButton.addEventListener('click', function () {

    imageInput.value = '';

    imagePreview.src = '';
    imagePreview.style.display = 'none';

    uploadPlaceholder.style.display = 'block';

    removeImageButton.style.display = 'none';
});


/* ==============================
   ขอพิกัด
============================== */

locationButton.addEventListener('click', function () {

    if (!navigator.geolocation) {
        alert('อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง');
        return;
    }

    locationButton.disabled = true;
    locationButton.textContent = '📍 กำลังค้นหาตำแหน่ง...';

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude.toFixed(6);

            const longitude =
                position.coords.longitude.toFixed(6);

            latitudeInput.value = latitude;
            longitudeInput.value = longitude;

            document.getElementById('latitudeText')
                .textContent = latitude;

            document.getElementById('longitudeText')
                .textContent = longitude;

            locationResult.style.display = 'grid';

            locationButton.textContent =
                '✓ บันทึกตำแหน่งแล้ว';

            locationButton.disabled = false;
        },

        function () {

            alert(
                'ไม่สามารถรับตำแหน่งได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง หรือระบุสถานที่ด้วยตนเอง'
            );

            locationButton.textContent =
                '📍 ใช้ตำแหน่งปัจจุบัน';

            locationButton.disabled = false;
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

});


/* ==============================
   ส่งรายงาน
============================== */

form.addEventListener('submit', function (event) {

    event.preventDefault();

    const image = imageInput.files[0];
    const area = document.getElementById('area').value.trim();
    const sourceType =
        document.getElementById('sourceType').value;

    if (!image) {
        alert('กรุณาถ่ายหรือเลือกรูปภาพ');
        return;
    }

    if (!area) {
        alert('กรุณาระบุสถานที่');
        return;
    }

    if (!sourceType) {
        alert('กรุณาเลือกประเภทแหล่งน้ำขัง');
        return;
    }

    /*
      ขั้นตอนถัดไป:
      ส่ง FormData ไป Backend
      POST /api/breeding-reports
    */

    form.style.display = 'none';

    document.getElementById('successBox')
        .style.display = 'block';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

});


/* ==============================
   เริ่มรายงานใหม่
============================== */

function resetReport() {

    form.reset();

    imagePreview.src = '';
    imagePreview.style.display = 'none';

    uploadPlaceholder.style.display = 'block';

    removeImageButton.style.display = 'none';

    latitudeInput.value = '';
    longitudeInput.value = '';

    locationResult.style.display = 'none';

    locationButton.textContent =
        '📍 ใช้ตำแหน่งปัจจุบัน';

    form.style.display = 'block';

    document.getElementById('successBox')
        .style.display = 'none';

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}