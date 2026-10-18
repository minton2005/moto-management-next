// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // ค้นหาผู้ใช้ในฐานข้อมูล SQLite
    // @ts-ignore
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username },
        ],
      },
    });

    if (user && user.password === password) {
      const response = NextResponse.json({
        success: true,
        user: { 
          id: user.id,
          name: user.name || user.username, 
          email: user.email,
          role: user.role || 'USER' 
        },
      });

      response.cookies.set('auth_token', `token-${user.id}`, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('auth_token');
  return response;
}