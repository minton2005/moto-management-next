// app/api/repairs/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: แก้ไขข้อมูลใบสั่งซ่อมตาม ID
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params; // await params เพื่อดึง id ออกมาให้ถูกต้อง
    const body = await request.json();

    const updatedRepair = await prisma.repair.update({
      where: { id: resolvedParams.id },
      data: {
        status: body.status,
        partsCost: body.partsCost !== undefined ? Number(body.partsCost) : undefined,
        laborCost: body.laborCost !== undefined ? Number(body.laborCost) : undefined,
        notes: body.notes,
      },
    });

    return NextResponse.json(updatedRepair);
  } catch (error) {
    console.error('PATCH repair error:', error);
    return NextResponse.json({ error: 'Failed to update repair' }, { status: 500 });
  }
}

// DELETE: ลบใบสั่งซ่อมตาม ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await prisma.repair.delete({
      where: { id: resolvedParams.id },
    });
    return NextResponse.json({ message: 'Repair deleted successfully' });
  } catch (error) {
    console.error('DELETE repair error:', error);
    return NextResponse.json({ error: 'Failed to delete repair' }, { status: 500 });
  }
}