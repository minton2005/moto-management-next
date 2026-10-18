import { NextResponse } from 'next/server';
import { mockUsers } from '../register/route';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // ค้นหาผู้ใช้จาก Mock Database
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const response = NextResponse.json({
        success: true,
        user: { name: user.name, role: 'USER' },
      });

      response.cookies.set('auth_token', `mock-token-${username}`, {
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
    return NextResponse.json(
      { success: false, message: 'Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('auth_token');
  return response;
}