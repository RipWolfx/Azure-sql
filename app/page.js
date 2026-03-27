'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error de inicio de sesión');
      }
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
        <h1 style={{ marginTop: 0, marginBottom: 12 }}>Iniciar sesión</h1>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Admin panel (demo) con Azure SQL</p>
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
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 16,
            width: '100%',
            padding: 10,
            borderRadius: 8,
            border: 'none',
            background: '#0ea5e9',
            color: '#fff',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div style={{ marginTop: 12, fontSize: 14, color: '#6b7280' }}>
          ¿No tienes cuenta?{' '}
          <a href="/register" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>
            Regístrate
          </a>
        </div>
      </form>
    </div>
  );
}
