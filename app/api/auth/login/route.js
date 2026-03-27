import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    let email = '';
    let password = '';
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData();
      email = form.get('email') || '';
      password = form.get('password') || '';
    }
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT TOP 1 id, name, email, role, password_hash FROM dbo.users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const isFormPost = contentType.includes('application/x-www-form-urlencoded');
    const res = isFormPost ? NextResponse.redirect(new URL('/admin', req.nextUrl)) : NextResponse.json({ success: true });
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60
    });
    return res;
  } catch (err) {
    console.error('AUTH_LOGIN_ERROR', { name: err?.name, code: err?.code, message: err?.message });
    if (typeof err?.message === 'string' && err.message.startsWith('MISSING_ENV:')) {
      return NextResponse.json({ success: false, message: 'Faltan variables de entorno de Azure SQL en Vercel' }, { status: 500 });
    }
    if (typeof err?.message === 'string' && err.message.toLowerCase().includes('failed to connect')) {
      return NextResponse.json({ success: false, message: 'No se pudo conectar a Azure SQL (revisa firewall/red y credenciales)' }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Error en login' }, { status: 500 });
  }
}
