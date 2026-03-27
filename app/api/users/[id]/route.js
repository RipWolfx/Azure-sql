import { NextResponse } from 'next/server';
import { getPool, sql } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { name, email, role, password } = body;
    const pool = await getPool();
    const request = pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('email', sql.VarChar, email)
      .input('role', sql.VarChar, role);
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      request.input('password_hash', sql.VarChar, hash);
      await request.query('UPDATE dbo.users SET name=@name, email=@email, role=@role, password_hash=@password_hash WHERE id=@id');
    } else {
      await request.query('UPDATE dbo.users SET name=@name, email=@email, role=@role WHERE id=@id');
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Error actualizando usuario' }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM dbo.users WHERE id=@id');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Error eliminando usuario' }, { status: 500 });
  }
}
