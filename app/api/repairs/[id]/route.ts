import { NextResponse } from 'next/server';
import { mockRepairs } from '@/lib/mockData';

// PATCH: อัปเดตข้อมูลรายการสั่งซ่อม
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();

    const repairIndex = mockRepairs.findIndex((r: any) => r.id === id);

    if (repairIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรายการสั่งซ่อม' },
        { status: 404 }
      );
    }

    mockRepairs[repairIndex] = {
      ...mockRepairs[repairIndex],
      ...body,
      estimatedCost:
        body.partsCost !== undefined || body.laborCost !== undefined
          ? Number(body.partsCost || 0) + Number(body.laborCost || 0)
          : body.estimatedCost !== undefined
          ? body.estimatedCost
          : mockRepairs[repairIndex].estimatedCost,
    };

    return NextResponse.json({
      success: true,
      data: mockRepairs[repairIndex],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: ลบรายการสั่งซ่อม
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const repairIndex = mockRepairs.findIndex((r: any) => r.id === id);

    if (repairIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบรายการสั่งซ่อม' },
        { status: 404 }
      );
    }

    // ลบรายการออกจาก mockRepairs
    mockRepairs.splice(repairIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'ลบรายการสำเร็จ',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}