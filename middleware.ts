import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // ถ้ายังไม่ได้ Login แล้วพยายามเข้าหน้าหลัก ให้ Redirect ไปหน้า /login
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ถ้า Login แล้ว แต่พยายามเข้าหน้า /login ให้ Redirect ไปหน้าหลัก
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};