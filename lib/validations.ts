// lib/validations.ts
import { z } from 'zod';

export const repairOrderSchema = z.object({
  customerName: z.string().min(2, 'ชื่อลูกค้าต้องมีความยาวอย่างน้อย 2 ตัวอักษร'),
  phone: z
    .string()
    .regex(/^0[0-9]{8,9}$/, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 0812345678)'),
  licensePlate: z.string().min(1, 'กรุณากรอกทะเบียนรถ (เช่น 1กข 1234)'),
  brand: z.string().min(1, 'กรุณาเลือกหรือกรอกยี่ห้อรถ'),
  model: z.string().min(1, 'กรุณาเลือกหรือกรอกรุ่นรถ'),
  brandModel: z.string().optional(),
  symptom: z.string().min(5, 'กรุณาระบุอาการแจ้งซ่อมอย่างน้อย 5 ตัวอักษร'),
  spareParts: z.string().optional(),
  partsCost: z.coerce.number().min(0, 'ค่าอะไหล่ต้องไม่ติดลบ').default(0),
  laborCost: z.coerce.number().min(0, 'ค่าแรงต้องไม่ติดลบ').default(0),
  
  // ปรับตรงนี้: ให้เป็น Optional (ใส่หรือไม่ใส่ก็ได้)
  mileage: z.coerce
    .number()
    .min(0, 'เลขไมล์ต้องไม่ติดลบ')
    .optional()
    .or(z.literal('')),
    
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
    message: 'สถานะไม่ถูกต้อง',
  }),
  estimatedCost: z.coerce
    .number({ message: 'ราคาประเมินต้องเป็นตัวเลข' })
    .min(0, 'ราคาประเมินต้องไม่ติดลบ'),
});

export type RepairOrderInput = z.infer<typeof repairOrderSchema>;