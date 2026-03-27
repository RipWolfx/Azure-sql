'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', role: 'user', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: '', email: '', role: 'user', password: '' });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar usuarios');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form };
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear usuario');
      setForm({ name: '', email: '', role: 'user', password: '' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateUser(id) {
    setError('');
    const payload = { ...editingForm };
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar usuario');
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(id) {
    setError('');
    if (!confirm('¿Eliminar usuario?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar usuario');
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Panel administrativo</h1>
        <button onClick={logout} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </div>
      <p style={{ color: '#6b7280' }}>Control de usuarios (CRUD) con base de datos Azure SQL</p>
      {error && <div style={{ marginTop: 12, color: '#b91c1c' }}>{error}</div>}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <section style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0 }}>Crear usuario</h2>
            <form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
              <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }}>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <input placeholder="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 8 }} />
              <button type="submit" style={{ gridColumn: '1 / -1', padding: 10, borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>
                Crear
              </button>
            </form>
          </section>

          <section style={{ marginTop: 32 }}>
            <h2 style={{ marginTop: 0 }}>Usuarios</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>ID</th>
                    <th style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Nombre</th>
                    <th style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Email</th>
                    <th style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Rol</th>
                    <th style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>{u.id}</td>
                      <td style={{ borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>
                        {editingId === u.id ? (
                          <input value={editingForm.name} onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                        ) : (
                          u.name
                        )}
                      </td>
                      <td style={{ borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>
                        {editingId === u.id ? (
                          <input value={editingForm.email} onChange={(e) => setEditingForm({ ...editingForm, email: e.target.value })} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }} />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td style={{ borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>
                        {editingId === u.id ? (
                          <select value={editingForm.role} onChange={(e) => setEditingForm({ ...editingForm, role: e.target.value })} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 6 }}>
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>
                      <td style={{ borderBottom: '1px solid #f3f4f6', padding: '8px 0' }}>
                        {editingId === u.id ? (
                          <>
                            <input placeholder="Nueva contraseña (opcional)" type="password" value={editingForm.password} onChange={(e) => setEditingForm({ ...editingForm, password: e.target.value })} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 6, marginRight: 8 }} />
                            <button onClick={() => updateUser(u.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', marginRight: 8 }}>
                              Guardar
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(u.id);
                                setEditingForm({ name: u.name, email: u.email, role: u.role, password: '' });
                              }}
                              style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', marginRight: 8 }}
                            >
                              Editar
                            </button>
                            <button onClick={() => deleteUser(u.id)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 12, color: '#6b7280' }}>Sin usuarios</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
