# Moto Management System (Next.js + Prisma + SQLite)

ระบบจัดการงานซ่อมรถจักรยานยนต์แบบ Full-stack พัฒนาด้วย Next.js (App Router), Prisma ORM และ SQLite Persistence สำหรับบันทึกและติดตามรายการแจ้งซ่อมของลูกค้า

**นาย สหรัฐ บุญเนาว์ 673450201-5**

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js (App Router)
- **Database:** SQLite Persistence
- **ORM:** Prisma ORM
- **Validation:** Zod Schema Validation
- **Styling:** Tailwind CSS + Lucide Icons

---

## 🚀 Key Features

- **Dashboard & Analytics:** สรุปยอดรวมใบซ่อม, งานที่กำลังดำเนินการ, งานที่เสร็จสิ้น และประเมินรายรับรวม
- **CRUD Operations:** เพิ่ม, แก้ไข, อัปเดตสถานะ และลบรายการสั่งซ่อม
- **Authentication System:** ระบบเข้าสู่ระบบ/สมัครสมาชิกพร้อม Cookie Session Handling
- **Document Generation:** รองรับการพิมพ์ใบรับรถ/ใบสั่งซ่อม

---

## ⚙️ Getting Started

เปิด Terminal ใน Folder ที่จะลง
ทำตามขั้นตอนด้านล่างนี้เพื่อติดตั้งและสั่งรันโปรเจกต์บนเครื่องของคุณ:

### 1. Clone Repository
```bash
git clone [https://github.com/minton2005/moto-management-next.git](https://github.com/minton2005/moto-management-next.git)
cd moto-management-next
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup (.env)
สร้างไฟล์ `.env` ไว้ที่ Root Directory ของโปรเจกต์ แล้วเพิ่มการเชื่อมต่อ SQLite Database:
```env
DATABASE_URL="file:./dev.db"
```

### 4. Prisma Database Setup
สั่งสร้าง/ซิงค์โครงสร้างตารางข้อมูล SQLite ผ่าน Prisma ORM:
```bash
npx prisma db push
```

*(ตัวเลือกเสริม) หากต้องการ Generate Prisma Client ใหม่:*
```bash
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```

เปิดเบราว์เซอร์แล้วเข้าไปที่ [http://localhost:3000](http://localhost:3000) เพื่อเริ่มใช้งานโปรเจกต์