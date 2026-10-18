// app/api/repairs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: ดึงรายการใบสั่งซ่อมทั้งหมดจาก Database
export async function GET() {
  try {
    const repairs = await prisma.repair.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(repairs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch repairs' }, { status: 500 });
  }
}

// POST: สร้างใบสั่งซ่อมใหม่ลง Database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRepair = await prisma.repair.create({
      data: {
        customer: body.customer,
        phone: body.phone,
        licensePlate: body.licensePlate,
        mileage: body.mileage || null,
        notes: body.notes || null,
        status: body.status || 'PENDING',
        partsCost: Number(body.partsCost) || 0,
        laborCost: Number(body.laborCost) || 0,
      },
    });
    return NextResponse.json(newRepair, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create repair' }, { status: 500 });
  }
}