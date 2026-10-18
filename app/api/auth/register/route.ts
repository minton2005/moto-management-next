import { NextResponse } from 'next/server';

// Mock Database สำหรับเก็บข้อมูลผู้ใช้ชั่วคราว
export const mockUsers = [
  { username: 'admin', password: '1234', name: 'ช่างสมศักดิ์ (Admin)' },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามี Username นี้ในระบบหรือยัง
    const existingUser = mockUsers.find((u) => u.username === username);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว' },
        { status: 400 }
      );
    }

    // เพิ่มผู้ใช้ใหม่ลงใน Mock Database
    mockUsers.push({ username, password, name });

    return NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ เข้าสู่ระบบได้ทันที',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}