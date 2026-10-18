// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ล้างข้อมูลเก่าในตาราง Repair ก่อน (ถ้ามี)
  await prisma.repair.deleteMany();

  // เพิ่มข้อมูลตัวอย่าง 5 รายการ
  await prisma.repair.createMany({
    data: [
      {
        customer: 'สมชาย สายซิ่ง',
        phone: '081-234-5678',
        licensePlate: '1กข-1234 กทม.',
        mileage: '15,200 กม.',
        notes: 'เปลี่ยนถ่ายน้ำมันเครื่อง และเช็กระยะเบรกหน้า-หลัง',
        status: 'PENDING',
        partsCost: 350,
        laborCost: 100,
      },
      {
        customer: 'วิภาดา ใจดี',
        phone: '089-876-5432',
        licensePlate: '3ขค-5678 นนทบุรี',
        mileage: '28,500 กม.',
        notes: 'ยางหลังรั่ว โดนตะปูแทง ต้องการเปลี่ยนยางใหม่',
        status: 'IN_PROGRESS',
        partsCost: 850,
        laborCost: 150,
      },
      {
        customer: 'อนุชา ยอดนักบิด',
        phone: '062-111-2233',
        licensePlate: '9งจ-9999 ขอนแก่น',
        mileage: '42,000 กม.',
        notes: 'เครื่องยนต์มีเสียงดังผิดปกติเวลาผ่อนคันเร่ง และเปลี่ยนหัวเทียน',
        status: 'COMPLETED',
        partsCost: 1200,
        laborCost: 400,
      },
      {
        customer: 'กิตติพงษ์ แรงดี',
        phone: '095-444-5566',
        licensePlate: '2ฉช-4321 ชลบุรี',
        mileage: '8,900 กม.',
        notes: 'เปลี่ยนโซ่ สเตอร์หน้า-หลัง และตั้งสายคลัทช์',
        status: 'IN_PROGRESS',
        partsCost: 1550,
        laborCost: 200,
      },
      {
        customer: 'ณัฐวุฒิ สุขสวัสดิ์',
        phone: '083-999-8877',
        licensePlate: '5ซฌ-7777 ปทุมธานี',
        mileage: '19,800 กม.',
        notes: 'ไฟหน้าไม่ติด และเปลี่ยนแบตเตอรี่ใหม่',
        status: 'COMPLETED',
        partsCost: 950,
        laborCost: 100,
      },
    ],
  });

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });