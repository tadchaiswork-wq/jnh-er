# คู่มือติดตั้ง ER Fast Track Web App

## ภาพรวม
ระบบนี้ประกอบด้วย 3 หน้า:
- `index.html` - หน้าหลัก เลือกโหมด
- `entry.html` - หน้าลงข้อมูล (สำหรับพยาบาล/แพทย์)
- `tv.html` - หน้าแสดงผลบนทีวี

ใช้ **Firebase Realtime Database** เป็น backend (ฟรี ใช้ได้ไม่จำกัด สำหรับการใช้งานขนาดเล็ก)

---

## ขั้นตอนที่ 1: สร้าง Firebase Project (ฟรี)

1. ไปที่ https://console.firebase.google.com/
2. ล็อกอินด้วย Google account
3. กดปุ่ม **"Add project"** หรือ **"สร้างโปรเจกต์"**
4. ตั้งชื่อ เช่น `er-fasttrack` แล้วกด Continue
5. เลือกไม่ใช้ Google Analytics (ไม่จำเป็น) แล้วกด Create

## ขั้นตอนที่ 2: เปิด Realtime Database

1. เมนูซ้าย → **Build** → **Realtime Database**
2. กด **Create Database**
3. เลือก location: **Singapore (asia-southeast1)** (ใกล้ไทยที่สุด)
4. เลือก **Start in test mode** (ทดลองก่อน, รักษาความปลอดภัยทีหลังได้)
5. กด Enable

## ขั้นตอนที่ 3: คัดลอก Firebase Config

1. ที่หน้า Project Overview → กดไอคอน **เฟือง ⚙️** → **Project settings**
2. เลื่อนลงมาที่ **Your apps** → กดไอคอน **`</>`** (Web)
3. ตั้งชื่อ app เช่น `er-app` → กด Register app
4. จะเห็น code แบบนี้:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "er-fasttrack.firebaseapp.com",
  databaseURL: "https://er-fasttrack-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "er-fasttrack",
  ...
};
```
5. **คัดลอกค่าทั้งหมด** ไปแก้ในไฟล์ `config.js`

⚠️ **สำคัญ**: ต้องมี `databaseURL` ด้วย (บางครั้ง Firebase แสดงไม่ครบ ให้กลับไปดูที่ Realtime Database จะมี URL อยู่ด้านบน)

---

## ขั้นตอนที่ 4: ทดลองใช้ที่บ้าน

### วิธีง่ายที่สุด: เปิดด้วย Local Server

ถ้ามี Python:
```bash
cd er-fasttrack
python3 -m http.server 8000
```
แล้วเปิด http://localhost:8000 ในเบราว์เซอร์

หรือถ้ามี Node.js:
```bash
npx serve er-fasttrack
```

❌ **ห้ามเปิดด้วยการดับเบิ้ลคลิกไฟล์โดยตรง** เพราะ ES modules ต้องโหลดผ่าน http://

---

## ขั้นตอนที่ 5: Deploy ออนไลน์ (ให้ใช้งานจริงได้)

### ทางเลือก A: Firebase Hosting (แนะนำ - อยู่กับ Firebase อยู่แล้ว)

1. ติดตั้ง Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login และ init:
```bash
cd er-fasttrack
firebase login
firebase init hosting
```
- เลือก project ที่สร้างไว้
- Public directory: `.` (จุด)
- Single-page app: **No**
- Overwrite index.html: **No**

3. Deploy:
```bash
firebase deploy
```

จะได้ URL แบบ `https://er-fasttrack.web.app`

### ทางเลือก B: Vercel (ง่ายมาก)

1. สมัครที่ https://vercel.com (ใช้ GitHub login)
2. กด **Add New Project**
3. ลาก folder `er-fasttrack` เข้าไป หรือ push ขึ้น GitHub แล้ว import
4. กด Deploy
5. ได้ URL แบบ `https://er-fasttrack.vercel.app`

### ทางเลือก C: Netlify Drop (ง่ายที่สุด - ลากวาง)

1. ไปที่ https://app.netlify.com/drop
2. ลาก folder `er-fasttrack` ทั้ง folder ไปวาง
3. ได้ URL ทันที

---

## ขั้นตอนที่ 6: ตั้งใช้งานในห้อง ER

### ที่จอทีวี:
1. ต่อคอมหรือ Android TV box เข้ากับทีวี
2. เปิดเบราว์เซอร์ → ไปที่ `https://your-url/tv.html`
3. กดปุ่ม "เริ่ม" (จะเข้าสู่ fullscreen อัตโนมัติ)
4. ตั้ง browser ให้เปิดหน้านี้อัตโนมัติเมื่อเปิดเครื่อง

💡 **เทคนิค**: ใช้ Chrome ใน kiosk mode:
```
chrome --kiosk https://your-url/tv.html
```

### ที่จุดลงข้อมูล:
- **Triage**: เปิดมือถือ/แท็บเล็ต → bookmark `https://your-url/entry.html`
- **ER**: เปิดคอม → bookmark `https://your-url/entry.html`

---

## ขั้นตอนที่ 7 (เพิ่มเติม): เพิ่มความปลอดภัย

หลังทดลองใช้แล้ว ให้แก้ Database Rules:

1. Firebase Console → Realtime Database → **Rules**
2. แก้เป็น:
```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "cases": {
      "$caseId": {
        ".validate": "newData.hasChildren(['disease', 'bed', 'startTime', 'duration'])"
      }
    }
  }
}
```

หากต้องการให้ใส่รหัสผ่านก่อนใช้งาน บอกผมได้ จะเพิ่ม authentication ให้

---

## การทดลองทำงาน

1. เปิด `entry.html` ในมือถือ
2. เปิด `tv.html` ในคอม
3. ลงข้อมูลในมือถือ → ดูทีวีว่ามีเคสปรากฏหรือไม่ (รอประมาณ 1-2 วินาที)
4. ลองตั้งเวลาให้เหลือ 10-11 นาที → ทีวีต้องกระพริบ + มีเสียง
5. ลองตั้งเวลาให้หมดเวลาแล้ว → ทีวีต้องแสดง "เกินเวลา" + เสียงแจ้ง

---

## ปัญหาที่อาจเจอ

**ไม่ขึ้น "ออนไลน์"**: เช็ค config.js ว่าใส่ค่าครบไหม โดยเฉพาะ `databaseURL`

**ไม่มีเสียง**: browser ต้องให้กดปุ่มก่อนเล่นเสียง — กดปุ่ม "เริ่ม" หรือ "เปิดเสียง" ก่อน

**ทีวีไม่ sync**: รีเฟรชหน้า ตรวจสอบ internet ที่ทีวี

---

## ขนาดการใช้งาน (Firebase Free Tier)

- เก็บข้อมูลได้ 1 GB
- ดาวน์โหลด 10 GB/เดือน
- เชื่อมต่อพร้อมกัน 100 connections

สำหรับห้อง ER 1 ห้อง (ทีวี 1 จอ + อุปกรณ์ลงข้อมูล 2-5 เครื่อง) ใช้ฟรีได้สบายๆ ตลอดไป
