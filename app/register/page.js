'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error registrando usuario');
      }
      setSuccess('Cuenta creada. Entrando al panel...');
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <form onSubmit={onSubmit} style={{ width: 360, background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ marginTop: 0, marginBottom: 12 }}>Registro</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Crea tu cuenta (rol user)</p>
        <label style={{ display: 'block', marginTop: 12 }}>Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
        <label style={{ display: 'block', marginTop: 12 }}>Correo</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
        <label style={{ display: 'block', marginTop: 12 }}>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
        />
        {error && <div style={{ marginTop: 12, color: '#b91c1c' }}>{error}</div>}
        {success && <div style={{ marginTop: 12, color: '#047857' }}>{success}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 16,
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: 'none',
            background: '#10b981',
            color: '#fff',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
        <div style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>
          ¿Ya tienes cuenta?{' '}
          <a href="/" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
            Inicia sesión
          </a>
        </div>
      </form>
    </div>
  );
}
