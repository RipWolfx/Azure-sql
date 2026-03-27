import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Nombre, email y contraseña son requeridos' }, { status: 400 });
    }

    const pool = await getPool();
    const existing = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT TOP 1 id FROM dbo.users WHERE email = @email');

    if (existing.recordset[0]) {
      return NextResponse.json({ success: false, message: 'El email ya está registrado' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 10);
    const inserted = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.VarChar, email)
      .input('role', sql.VarChar, 'user')
      .input('password_hash', sql.VarChar, hash)
      .query('INSERT INTO dbo.users (name, email, role, password_hash) OUTPUT INSERTED.id VALUES (@name, @email, @role, @password_hash)');

    const newId = inserted.recordset?.[0]?.id;
    const token = signToken({ id: newId, email, role: 'user' });

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
    console.error('AUTH_REGISTER_ERROR', { name: err?.name, code: err?.code, message: err?.message });
    if (typeof err?.message === 'string' && err.message.startsWith('MISSING_ENV:')) {
      return NextResponse.json({ success: false, message: 'Faltan variables de entorno de Azure SQL en Vercel' }, { status: 500 });
    }
    if (typeof err?.message === 'string' && err.message.toLowerCase().includes('failed to connect')) {
      return NextResponse.json({ success: false, message: 'No se pudo conectar a Azure SQL (revisa firewall/red y credenciales)' }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'Error registrando usuario' }, { status: 500 });
  }
}
