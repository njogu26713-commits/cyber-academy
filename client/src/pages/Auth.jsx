import React, { useState } from 'react';
import { useAuth } from '../App.jsx';

export default function Auth({ onBack }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('login'); // login | register
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      login(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.08), transparent)',
    }}>
      <button
        onClick={onBack}
        style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
      >
        ← Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔥</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Firebox <span style={{ color: 'var(--primary)' }}>Cyber Academy</span>
        </h1>
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--surface)', borderRadius: '8px', padding: '4px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: '0.9rem', fontWeight: 500,
                background: mode === m ? 'var(--card)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Username
              </label>
              <input className="input" type="text" placeholder="e.g. hackerwizard42" value={form.username}
                onChange={e => set('username', e.target.value)} required minLength={2} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Email
            </label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.4rem', fontWeight: 500 }}>
              Password
            </label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => set('password', e.target.value)} required minLength={6} />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.85rem', color: '#f87171',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Please wait...' : mode === 'login' ? '🔥 Sign In' : '🚀 Create Account & Start Learning'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            {mode === 'login' ? 'Create one free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
