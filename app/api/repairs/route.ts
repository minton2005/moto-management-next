import { NextResponse } from 'next/server';
import { mockRepairs } from '@/lib/mockData';
import { repairOrderSchema } from '@/lib/validations';

// 1. GET: ดึงรายการสั่งซ่อมทั้งหมด (รองรับ ค้นหา + กรองสถานะ)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';

    let filtered = [...mockRepairs];

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.licensePlate.toLowerCase().includes(search) ||
          item.customerName.toLowerCase().includes(search) ||
          item.phone.includes(search) ||
          item.id.toLowerCase().includes(search)
      );
    }

    if (status) {
      filtered = filtered.filter((item) => item.status === status);
    }

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}

// 2. POST: เปิดใบสั่งซ่อมใหม่ (รัน ID แบบไม่ซ้ำ)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    const validationResult = repairOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // หา ID ตัวที่มากที่สุดเพื่อรัน REP-xxx ไม่ให้ซ้ำ
    const maxId = mockRepairs.reduce((max, item) => {
      const num = parseInt(item.id.replace('REP-', ''), 10) || 0;
      return num > max ? num : max;
    }, 0);

    const newId = `REP-${String(maxId + 1).padStart(3, '0')}`;

    const newOrder = {
      id: newId,
      customerName: data.customerName,
      phone: data.phone,
      licensePlate: data.licensePlate,
      brandModel: `${data.brand} ${data.model}`,
      symptom: data.symptom,
      spareParts: data.spareParts || '',
      partsCost: Number(data.partsCost) || 0,
      laborCost: Number(data.laborCost) || 0,
      mileage: Number(data.mileage) || 0,
      status: data.status,
      estimatedCost: Number(data.estimatedCost) || 0,
      createdAt: new Date().toISOString(),
    };

    mockRepairs.unshift(newOrder as any);

    return NextResponse.json({
      success: true,
      data: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}