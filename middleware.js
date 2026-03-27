import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const protectedPaths = ['/admin', '/api/users'];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('auth_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/users/:path*']
};
