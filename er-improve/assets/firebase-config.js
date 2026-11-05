/*
 * CHANGE-13 — ตั้งค่าฐานข้อมูลกลาง (Firebase Firestore)
 * ว่างไว้ = ใช้ข้อมูลในเครื่องนี้เท่านั้น
 * วิธีได้ค่า: Firebase console → Project settings → Your apps → Web app → firebaseConfig
 * ข้อมูลสมมติเท่านั้น — ห้ามใส่ข้อมูลผู้ป่วยจริง
 */
window.KPHIS_FIREBASE = null;
/* ตัวอย่าง:
window.KPHIS_FIREBASE = {
    apiKey: "AIza....",
    authDomain: "kphis-er-demo.firebaseapp.com",
    projectId: "kphis-er-demo",
    appId: "1:123456789:web:abcdef",
    prefix: "kphis_er_demo"          // ชื่อชุดข้อมูล (เปลี่ยนเพื่อแยกชุดทดลอง)
};
*/
