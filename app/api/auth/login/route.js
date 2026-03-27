import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
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
    const res = NextResponse.json({ success: true });
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60
    });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Error en login' }, { status: 500 });
  }
}
