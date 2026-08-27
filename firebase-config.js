// ============================================================
//  JNH ER — Firebase config (โปรเจกต์ใหม่ ใช้ร่วมกันทั้งระบบ)
//  ------------------------------------------------------------
//  ระบบนี้ใช้ 1 โปรเจกต์ Firebase ร่วมกันทั้ง:
//    • แอปเช็คของ (Checklist)      → เก็บที่ Realtime Database
//    • Monitor รวม                 → อ่านสถานะเช็คของแบบ realtime
//    • JNH ER Portal (ล็อกอิน)     → Authentication + โปรไฟล์ผู้ใช้
//
//  วิธีตั้งค่า (ทำครั้งเดียว) — ดูละเอียดในไฟล์ README-setup.md
//   1) console.firebase.google.com → Add project → ตั้งชื่อ เช่น jnh-er
//   2) Build → Authentication → Get started → เปิด Email/Password
//   3) Build → Realtime Database → Create database → location: Singapore
//        (asia-southeast1) → Start in locked mode → แล้วเอา rules จาก
//        database.rules.json ในโฟลเดอร์นี้ไปวางแล้ว Publish
//   4) ⚙️ Project settings → Your apps → </> (Web) → คัดลอกค่า config
//        มาวางแทนค่าด้านล่างนี้ให้ครบ (ที่สำคัญคือ databaseURL)
// ============================================================

window.FIREBASE_CONFIG = {
apiKey: "AIzaSyCn4SbmIFh9a5ZNE649Eroe-F1Gy0wxMU4",
    authDomain: "jnh-er-7f427.firebaseapp.com",
    databaseURL: "https://jnh-er-7f427-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "jnh-er-7f427",
    storageBucket: "jnh-er-7f427.firebasestorage.app",
    messagingSenderId: "600315189157",
    appId: "1:600315189157:web:fa52cdded69d3c9998ba4c",
    measurementId: "G-XVCY5GV8B1"
};

// username -> อีเมลปลอม (ผู้ใช้ไม่ต้องมีอีเมลจริง) ใช้กับ Portal ล็อกอิน
window.EMAIL_DOMAIN = "jnher.web";

// admin ใหญ่ของ Portal — สมัคร username นี้แล้วจะได้สิทธิ์ superadmin อัตโนมัติ
window.SUPERADMIN_USERNAME = "pettoo";
