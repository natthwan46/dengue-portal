// ==========================================
// ELEMENTS
// ==========================================

const form =
  document.getElementById('assessmentForm');

const resultBox =
  document.getElementById('resultBox');


// ==========================================
// SUBMIT ASSESSMENT
// ==========================================

form.addEventListener(
  'submit',
  function (event) {

    event.preventDefault();


    // ======================================
    // ข้อมูลเบื้องต้น
    // ======================================

    const age =
      Number(
        document.getElementById('age').value
      );


    const feverDays =
      Number(
        document.getElementById('feverDays').value
      );


    const temperature =
      Number(
        document.getElementById('temperature').value
      );


    // ======================================
    // อาการทั่วไป
    // ======================================

    const symptoms =
      Array.from(
        document.querySelectorAll(
          'input[name="symptom"]:checked'
        )
      ).map(
        checkbox => checkbox.value
      );


    // ======================================
    // สัญญาณอันตราย
    // ======================================

    const dangerSymptoms =
      Array.from(
        document.querySelectorAll(
          'input[name="danger"]:checked'
        )
      ).map(
        checkbox => checkbox.value
      );


    // ======================================
    // ตรวจสอบข้อมูล
    // ======================================

    if (
      !Number.isFinite(age) ||
      age <= 0
    ) {

      alert('กรุณากรอกอายุให้ถูกต้อง');

      return;

    }


    if (
      !Number.isFinite(feverDays) ||
      feverDays < 0
    ) {

      alert('กรุณาระบุจำนวนวันที่มีไข้');

      return;

    }


    if (
      !Number.isFinite(temperature) ||
      temperature < 30 ||
      temperature > 45
    ) {

      alert('กรุณาระบุอุณหภูมิร่างกายให้ถูกต้อง');

      return;

    }


    // ======================================
    // ประเมินผล
    // ======================================

    let result;


    // --------------------------------------
    // ระดับ 3 : พบสัญญาณอันตราย
    // --------------------------------------

    if (dangerSymptoms.length > 0) {

      result = {

        level: 'danger',

        icon: '🚨',

        title:
          'พบสัญญาณที่ควรได้รับการประเมินทางการแพทย์',

        description:
          `พบสัญญาณเตือน ${dangerSymptoms.length} รายการ จากข้อมูลที่เลือก`,

        advice:
          'ควรไปสถานพยาบาลเพื่อรับการประเมินโดยบุคลากรทางการแพทย์ โดยเฉพาะหากอาการรุนแรงขึ้น ไม่ควรรอผลจากแบบประเมินนี้แทนการตรวจรักษา'

      };

    }


    // --------------------------------------
    // ระดับ 2 : ควรเฝ้าระวัง
    // --------------------------------------

    else if (
      feverDays >= 2 &&
      symptoms.length >= 3
    ) {

      result = {

        level: 'warning',

        icon: '🟡',

        title:
          'ควรเฝ้าระวังอาการ',

        description:
          `มีไข้ ${feverDays} วัน และพบอาการร่วม ${symptoms.length} รายการ`,

        advice:
          'ควรติดตามอาการอย่างใกล้ชิด พักผ่อนและดื่มน้ำให้เพียงพอ หากไข้หรืออาการไม่ดีขึ้น หรือเริ่มมีสัญญาณอันตราย ควรไปพบแพทย์'

      };

    }


    // --------------------------------------
    // มีไข้สูง
    // --------------------------------------

    else if (
      temperature >= 38.5
    ) {

      result = {

        level: 'warning',

        icon: '🌡️',

        title:
          'ควรติดตามอาการไข้',

        description:
          `อุณหภูมิที่ระบุคือ ${temperature.toFixed(1)} °C`,

        advice:
          'ควรสังเกตอาการร่วมและติดตามอุณหภูมิ หากมีไข้ต่อเนื่อง อาการแย่ลง หรือมีสัญญาณอันตราย ควรปรึกษาบุคลากรทางการแพทย์'

      };

    }


    // --------------------------------------
    // ระดับ 1 : ยังไม่พบสัญญาณอันตราย
    // --------------------------------------

    else {

      result = {

        level: 'low',

        icon: '🟢',

        title:
          'ยังไม่พบสัญญาณอันตรายจากแบบประเมิน',

        description:
          'จากข้อมูลที่กรอก ยังไม่เข้าเกณฑ์เฝ้าระวังที่กำหนดไว้ในแบบประเมินเบื้องต้น',

        advice:
          'ควรสังเกตอาการต่อเนื่อง พักผ่อนให้เพียงพอ และป้องกันยุงกัด หากมีอาการผิดปกติ อาการไม่ดีขึ้น หรือรุนแรงขึ้น ควรพบแพทย์'

      };

    }


    showResult(result);

  }
);


// ==========================================
// SHOW RESULT
// ==========================================

function showResult(result) {

  document.getElementById(
    'resultIcon'
  ).textContent =
    result.icon;


  document.getElementById(
    'resultTitle'
  ).textContent =
    result.title;


  document.getElementById(
    'resultDescription'
  ).textContent =
    result.description;


  document.getElementById(
    'resultAdvice'
  ).textContent =
    result.advice;


  // ลบระดับเก่า
  resultBox.classList.remove(
    'result-low',
    'result-warning',
    'result-danger'
  );


  // เพิ่มระดับใหม่
  if (result.level === 'danger') {

    resultBox.classList.add(
      'result-danger'
    );

  }

  else if (
    result.level === 'warning'
  ) {

    resultBox.classList.add(
      'result-warning'
    );

  }

  else {

    resultBox.classList.add(
      'result-low'
    );

  }


  resultBox.classList.add('show');


  resultBox.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

}


// ==========================================
// RESET
// ==========================================

function resetAssessment() {

  form.reset();


  resultBox.classList.remove(
    'show',
    'result-low',
    'result-warning',
    'result-danger'
  );


  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

}