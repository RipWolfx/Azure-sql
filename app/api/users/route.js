import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT id, name, email, role FROM dbo.users ORDER BY id DESC');
    return NextResponse.json({ users: result.recordset });
  } catch {
    return NextResponse.json({ message: 'Error obteniendo usuarios' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, role, password } = body;
    if (!name || !email || !role || !password) {
      return NextResponse.json({ message: 'Todos los campos son requeridos' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    const pool = await getPool();
    await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.VarChar, email)
      .input('role', sql.VarChar, role)
      .input('password_hash', sql.VarChar, hash)
      .query('INSERT INTO dbo.users (name, email, role, password_hash) VALUES (@name, @email, @role, @password_hash)');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Error creando usuario' }, { status: 500 });
  }
}
