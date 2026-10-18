// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, name, email } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // 1. ตรวจสอบว่ามี Username นี้ในฐานข้อมูลแล้วหรือยัง
    // @ts-ignore
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          ...(email ? [{ email: email }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้งานหรืออีเมลนี้ถูกใช้ไปแล้ว' },
        { status: 400 }
      );
    }

    // 2. บันทึกผู้ใช้ใหม่ลงใน SQLite Database ผ่าน Prisma
    // @ts-ignore
    await prisma.user.create({
      data: {
        username,
        password, // ในระบบโปรดักชันจริงควรเข้ารหัสรหัสผ่านด้วย bcrypt
        name,
        email: email || `${username}@example.com`,
        role: 'USER',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ เข้าสู่ระบบได้ทันที',
    });
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}