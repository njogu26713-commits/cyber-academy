import React, { useState, useEffect, createContext, useContext } from 'react';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Learn from './pages/Learn.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('landing'); // landing | auth | learn

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setPage('learn');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
    setPage('learn');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setPage('landing');
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔥</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading Firebox...</div>
      </div>
    </div>
  );

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      {page === 'landing' && <Landing onGetStarted={() => setPage('auth')} />}
      {page === 'auth' && <Auth onBack={() => setPage('landing')} />}
      {page === 'learn' && <Learn />}
    </AuthCtx.Provider>
  );
}
