/*!
 * time-sync.js — JNH ER shared time source
 * ทำให้ทุกแอพใช้ "เวลากลางจากอินเทอร์เน็ต" แทนนาฬิกาของเครื่อง
 *
 * วิธีทำงาน (เบา ไม่กินพื้นที่ ไม่ทำให้ช้า):
 *  1) ดึงค่าชดเชยเวลา (offset) จาก server ครั้งเดียวตอนเปิดแอพ
 *     - ถ้ามี Firebase RTDB  -> ใช้ .info/serverTimeOffset (แม่นระดับ ms, แก้ตัวเองอัตโนมัติ)
 *     - ถ้าไม่มี            -> อ่าน header 'Date' จากคำขอ HEAD ไปที่ตัวเอง (แม่นระดับวินาที)
 *  2) แก้ global Date / Date.now() ให้บวก offset อัตโนมัติ
 *     => โค้ดเดิมทุกบรรทัดที่ใช้ new Date() หรือ Date.now() จะได้เวลากลางทันที โดยไม่ต้องแก้ทีละจุด
 *  3) ออฟไลน์/ยิงไม่สำเร็จ -> offset = 0 คือกลับไปใช้เวลาเครื่องเองอัตโนมัติ (ไม่พัง)
 *
 * ไม่มีการบันทึกข้อมูลเพิ่ม: offset เป็นตัวเลขตัวเดียวในหน่วยความจำ ไม่ได้เก็บซ้ำในแต่ละ record
 * timestamp ที่บันทึกลงฐานข้อมูลขนาดเท่าเดิม เพียงแต่ค่าอ้างอิงเวลากลางแทนเวลาเครื่อง
 */
(function () {
  'use strict';
  if (window.__JNH_TIME_SYNC__) return;      // กันโหลดซ้ำ
  window.__JNH_TIME_SYNC__ = true;

  var RealDate = Date;                        // เก็บ Date ของจริงไว้ก่อน patch
  var offset = 0;                            // ms ที่ต้องบวกเข้าเวลาเครื่อง
  var synced = false;
  var source = 'device';                     // 'device' | 'http' | 'firebase'

  function realNow() { return RealDate.now(); }
  function corrNow() { return RealDate.now() + offset; }

  // ---------- API ที่เรียกใช้เองได้ ----------
  window.ServerTime = {
    now: corrNow,                            // epoch ms (เวลากลาง)
    date: function () { return new RealDate(corrNow()); },
    iso:  function () { return new RealDate(corrNow()).toISOString(); },
    get offset() { return offset; },
    get synced() { return synced; },
    get source() { return source; }
  };

  // ---------- patch global Date ให้โค้ดเดิมใช้เวลากลางอัตโนมัติ ----------
  function PatchedDate(a, b, c, d, e, f, g) {
    if (arguments.length === 0) return new RealDate(corrNow());   // new Date() = เวลากลาง "ตอนนี้"
    switch (arguments.length) {                                    // args อื่น = parsing เดิม ไม่ยุ่ง
      case 1: return new RealDate(a);
      case 2: return new RealDate(a, b);
      case 3: return new RealDate(a, b, c);
      case 4: return new RealDate(a, b, c, d);
      case 5: return new RealDate(a, b, c, d, e);
      case 6: return new RealDate(a, b, c, d, e, f);
      default: return new RealDate(a, b, c, d, e, f, g);
    }
  }
  PatchedDate.prototype = RealDate.prototype;    // instanceof / เมธอดทั้งหมดยังทำงานปกติ
  PatchedDate.now = corrNow;                      // Date.now() = เวลากลาง
  PatchedDate.parse = RealDate.parse;
  PatchedDate.UTC = RealDate.UTC;
  try { Object.defineProperty(PatchedDate, 'name', { value: 'Date' }); } catch (e) {}
  window.Date = PatchedDate;

  // ---------- แหล่งที่ 1: HTTP Date header (ใช้ได้ทุกแอพ, same-origin) ----------
  function httpSync() {
    try {
      var t0 = realNow();
      fetch(location.href, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) {
          var t1 = realNow();
          var hd = r.headers.get('date');
          if (!hd) return;
          var srv = RealDate.parse(hd);
          if (isNaN(srv)) return;
          if (source !== 'firebase') {                 // ไม่ทับ firebase ถ้ามีแล้ว
            offset = srv + (t1 - t0) / 2 - t1;          // ชดเชย latency ครึ่งรอบ
            synced = true;
            source = 'http';
          }
        })
        .catch(function () {});
    } catch (e) {}
  }

  // ---------- แหล่งที่ 2: Firebase RTDB serverTimeOffset (แม่นสุด) ----------
  var tries = 0;
  function fbSync() {
    tries++;
    try {
      if (window.firebase && firebase.apps && firebase.apps.length && firebase.database) {
        firebase.database().ref('.info/serverTimeOffset').on('value', function (snap) {
          var o = snap.val();
          if (typeof o === 'number') { offset = o; synced = true; source = 'firebase'; }
        });
        return;                                         // subscribe แล้ว หยุด poll
      }
    } catch (e) {}
    if (tries < 40) setTimeout(fbSync, 250);            // รอ firebase init ~10 วิ
  }

  httpSync();
  fbSync();
  // sync ซ้ำทุก 5 นาที เฉพาะกรณียังไม่ได้ใช้ firebase (กัน clock ค่อยๆ เพี้ยน)
  setInterval(function () { if (source !== 'firebase') httpSync(); }, 5 * 60 * 1000);
})();
