const knowledgeData = {

  about: {
    icon: '🦠',
    title: 'โรคไข้เลือดออกคืออะไร?',
    content: `
      <p>
        โรคไข้เลือดออกเป็นโรคที่เกิดจาก
        <strong>เชื้อไวรัสเดงกี (Dengue virus)</strong>
        โดยมียุงลายที่มีเชื้อเป็นพาหะนำโรค
      </p>

      <ul>
        <li>สามารถพบได้ในเด็กและผู้ใหญ่</li>
        <li>ยุงได้รับเชื้อเมื่อกัดผู้ที่มีเชื้อไวรัสในกระแสเลือด</li>
        <li>จากนั้นยุงที่มีเชื้อสามารถแพร่เชื้อผ่านการกัดคนอื่นได้</li>
        <li>การลดจำนวนยุงและแหล่งเพาะพันธุ์ช่วยลดความเสี่ยงของโรคได้</li>
      </ul>

      <div class="modal-highlight">
        การป้องกันยุงกัดและกำจัดแหล่งเพาะพันธุ์ยุงลาย
        เป็นส่วนสำคัญในการลดความเสี่ยงของโรคไข้เลือดออก
      </div>
    `
  },


  symptoms: {
    icon: '🤒',
    title: 'อาการที่ควรรู้',
    content: `
      <p>
        ผู้ที่ติดเชื้อบางรายอาจไม่มีอาการ
        ขณะที่ผู้ที่มีอาการอาจพบอาการต่าง ๆ เช่น
      </p>

      <ul>
        <li>ไข้สูง</li>
        <li>ปวดศีรษะ</li>
        <li>ปวดบริเวณรอบหรือหลังดวงตา</li>
        <li>ปวดเมื่อยกล้ามเนื้อและข้อ</li>
        <li>คลื่นไส้หรืออาเจียน</li>
        <li>เบื่ออาหาร</li>
        <li>มีผื่น</li>
      </ul>

      <div class="modal-highlight">
        อาการของแต่ละคนอาจแตกต่างกัน
        การประเมินอาการจากเว็บไซต์ไม่สามารถยืนยันการวินิจฉัยโรคได้
      </div>
    `
  },


  danger: {
    icon: '⚠️',
    title: 'สัญญาณอันตราย',
    content: `
      <p>
        ควรเฝ้าระวังอาการผิดปกติอย่างใกล้ชิด
        โดยเฉพาะเมื่อไข้เริ่มลดลง
      </p>

      <ul>
        <li>ปวดท้องมากหรือกดเจ็บบริเวณท้อง</li>
        <li>อาเจียนต่อเนื่อง</li>
        <li>มีเลือดออกผิดปกติ</li>
        <li>อาเจียนเป็นเลือดหรือถ่ายดำ</li>
        <li>ซึมลง กระสับกระส่าย หรืออ่อนเพลียมากผิดปกติ</li>
        <li>มือเท้าเย็น หรือมีอาการทรุดลงอย่างรวดเร็ว</li>
      </ul>

      <div class="modal-highlight danger-highlight">
        หากมีอาการรุนแรงหรือมีสัญญาณอันตราย
        ควรไปโรงพยาบาลหรือพบแพทย์โดยเร็ว
      </div>
    `
  },


  mosquito: {
    icon: '🦟',
    title: 'รู้จักยุงลาย',
    content: `
      <p>
        ยุงลายเป็นพาหะสำคัญของโรคไข้เลือดออก
        และสามารถเพาะพันธุ์ในภาชนะที่มีน้ำขังได้
      </p>

      <ul>
        <li>มักพบแหล่งเพาะพันธุ์บริเวณบ้านและชุมชน</li>
        <li>ไข่และลูกน้ำสามารถอยู่ในภาชนะเก็บน้ำหรือภาชนะที่มีน้ำขัง</li>
        <li>ควรตรวจบริเวณรอบบ้านอย่างสม่ำเสมอ</li>
      </ul>

      <div class="modal-highlight">
        อย่ามองข้ามภาชนะขนาดเล็ก
        เพราะน้ำที่ขังอยู่ก็อาจกลายเป็นแหล่งเพาะพันธุ์ยุงได้
      </div>
    `
  },


  prevention: {
    icon: '🛡️',
    title: 'วิธีป้องกันยุงกัด',
    content: `
      <p>
        การลดโอกาสถูกยุงกัดเป็นอีกวิธีหนึ่ง
        ที่ช่วยลดความเสี่ยงจากโรคที่มียุงเป็นพาหะ
      </p>

      <ul>
        <li>สวมเสื้อผ้าที่ช่วยปกปิดผิวหนัง</li>
        <li>ใช้ผลิตภัณฑ์ป้องกันยุงตามคำแนะนำบนฉลาก</li>
        <li>ใช้มุ้งหรือมุ้งลวดเพื่อช่วยป้องกันยุง</li>
        <li>ลดบริเวณอับชื้นและบริเวณที่ยุงอาจอาศัย</li>
        <li>ตรวจและกำจัดแหล่งน้ำขังรอบบ้าน</li>
      </ul>
    `
  },


  breeding: {
    icon: '🪣',
    title: 'กำจัดแหล่งเพาะพันธุ์ยุงลาย',
    content: `
      <p>
        ควรตรวจบริเวณบ้านและชุมชน
        เพื่อค้นหาภาชนะหรือจุดที่อาจมีน้ำขัง
      </p>

      <ul>
        <li>ปิดภาชนะเก็บน้ำให้มิดชิด</li>
        <li>เปลี่ยนน้ำในภาชนะที่จำเป็นเป็นประจำ</li>
        <li>กำจัดภาชนะที่ไม่ใช้และสามารถรองรับน้ำได้</li>
        <li>ตรวจจานรองกระถางต้นไม้และภาชนะรอบบ้าน</li>
        <li>รักษาความสะอาดบริเวณบ้านและชุมชน</li>
      </ul>

      <div class="modal-highlight">
        ควรสำรวจแหล่งน้ำขังอย่างสม่ำเสมอ
        ไม่ใช่เฉพาะช่วงที่มีการระบาด
      </div>
    `
  },


  care: {
    icon: '🩺',
    title: 'การดูแลเบื้องต้นเมื่อมีไข้',
    content: `
      <p>
        หากมีไข้ ควรติดตามอาการอย่างใกล้ชิด
        และขอคำแนะนำจากบุคลากรทางการแพทย์เมื่อจำเป็น
      </p>

      <ul>
        <li>พักผ่อนให้เพียงพอ</li>
        <li>ดื่มน้ำหรือของเหลวให้เพียงพอ</li>
        <li>สังเกตอาการผิดปกติและสัญญาณอันตราย</li>
        <li>ใช้ยาตามคำแนะนำของแพทย์หรือเภสัชกร</li>
      </ul>

      <div class="modal-highlight danger-highlight">
        หากสงสัยโรคไข้เลือดออก
        ควรหลีกเลี่ยงยา aspirin และ ibuprofen
        เนื่องจากอาจเพิ่มความเสี่ยงต่อเลือดออก
        และควรปรึกษาบุคลากรทางการแพทย์เกี่ยวกับการใช้ยา
      </div>
    `
  },


  hospital: {
    icon: '🏥',
    title: 'เมื่อไรควรไปโรงพยาบาล?',
    content: `
      <p>
        ควรได้รับการประเมินจากบุคลากรทางการแพทย์
        หากมีอาการน่าเป็นห่วงหรืออาการแย่ลง
      </p>

      <ul>
        <li>มีอาการปวดท้องรุนแรง</li>
        <li>อาเจียนต่อเนื่อง</li>
        <li>มีเลือดออกผิดปกติ</li>
        <li>ซึมลงหรืออ่อนเพลียมาก</li>
        <li>ดื่มน้ำไม่ได้หรือมีอาการขาดน้ำ</li>
        <li>อาการโดยรวมทรุดลง โดยเฉพาะในช่วงไข้ลด</li>
      </ul>

      <div class="modal-highlight danger-highlight">
        หากมีอาการรุนแรง ไม่ควรรอประเมินอาการด้วยระบบออนไลน์
        ควรไปสถานพยาบาลเพื่อรับการประเมินโดยเร็ว
      </div>
    `
  }

};


// ==========================================
// เปิดรายละเอียด
// ==========================================

function openKnowledge(type) {

  const data = knowledgeData[type];

  if (!data) {
    return;
  }

  document.getElementById(
    'modalIcon'
  ).textContent = data.icon;

  document.getElementById(
    'modalTitle'
  ).textContent = data.title;

  document.getElementById(
    'modalContent'
  ).innerHTML = data.content;

  document.getElementById(
    'knowledgeModal'
  ).classList.add('show');

  document.body.style.overflow = 'hidden';
}


// ==========================================
// ปิดรายละเอียด
// ==========================================

function closeKnowledge() {

  document.getElementById(
    'knowledgeModal'
  ).classList.remove('show');

  document.body.style.overflow = '';
}


// ==========================================
// Search
// ==========================================

const searchInput =
  document.getElementById('searchInput');

const cards =
  document.querySelectorAll('.knowledge-card');

const noResult =
  document.getElementById('noResult');


searchInput.addEventListener(
  'input',
  function () {

    const keyword =
      this.value
        .trim()
        .toLowerCase();

    let found = 0;


    cards.forEach(card => {

      const searchText =
        (
          card.textContent +
          ' ' +
          card.dataset.search
        ).toLowerCase();


      if (
        searchText.includes(keyword)
      ) {

        card.style.display = 'flex';

        found++;

      } else {

        card.style.display = 'none';

      }

    });


    noResult.style.display =
      found === 0
        ? 'block'
        : 'none';

  }
);


// ==========================================
// กดพื้นที่ด้านนอก Modal เพื่อปิด
// ==========================================

document.getElementById(
  'knowledgeModal'
).addEventListener(
  'click',
  function (event) {

    if (event.target === this) {
      closeKnowledge();
    }

  }
);


// ==========================================
// กด ESC เพื่อปิด
// ==========================================

document.addEventListener(
  'keydown',
  function (event) {

    if (event.key === 'Escape') {
      closeKnowledge();
    }

  }
);