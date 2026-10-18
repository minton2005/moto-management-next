export interface RepairOrder {
  id: string;
  customerName: string;
  phone: string;
  licensePlate: string;
  brandModel: string;
  symptom: string;
  spareParts?: string;
  partsCost?: number;
  laborCost?: number;
  mileage: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedCost: number;
  createdAt: string;
}

export let mockRepairs: RepairOrder[] = [
  {
    id: 'REP-001',
    customerName: 'สมชาย ใจดี',
    phone: '0812345678',
    licensePlate: '1กข 1234',
    brandModel: 'Honda Wave 125i',
    symptom: 'ถ่ายน้ำมันเครื่อง และเช็กระยะเบรก',
    mileage: 12500,
    status: 'COMPLETED',
    estimatedCost: 450,
    partsCost: 250,
    laborCost: 200,
    spareParts: 'น้ำมันเครื่อง 10W-40, ผ้าเบรกหน้า',
    createdAt: '2026-10-15T09:00:00.000Z',
  },
  {
    id: 'REP-002',
    customerName: 'วิภาดา รักสวย',
    phone: '0898765432',
    licensePlate: '2กจ 5678',
    brandModel: 'Yamaha Grand Filano',
    symptom: 'รถสตาร์ตไม่ติด มีเสียงดังแปลกๆ ที่ชุดข้าง',
    mileage: 8200,
    status: 'IN_PROGRESS',
    estimatedCost: 1200,
    createdAt: '2026-10-16T10:30:00.000Z',
  },
  {
    id: 'REP-003',
    customerName: 'อนันต์ สายลุย',
    phone: '0821112233',
    licensePlate: '3กท 9999',
    brandModel: 'Honda PCX 160',
    symptom: 'เปลี่ยนยางหน้า-หลัง และผ้าเบรก',
    mileage: 15400,
    status: 'PENDING',
    estimatedCost: 2800,
    createdAt: '2026-10-17T08:15:00.000Z',
  },
];