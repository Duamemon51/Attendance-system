'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Redirect if already logged in
    if (localStorage.getItem('admin_token')) {
      router.replace('/admin/dashboard');
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_name', data.name || username);
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Prevent SSR render — avoids hydration mismatch from localStorage check
  if (!mounted) return null;

  return (
    <div className="page" style={{ paddingTop: 0 }}>
      <nav className="topbar">
        <div className="logo">
          <div className="logo-mark">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.5)" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <span className="logo-name">Attend<em>X</em></span>
        </div>
        <div className="topbar-spacer" />
        <Link href="/" className="topbar-btn">← Employee Portal</Link>
      </nav>

      <div className="auth-wrap">
        <div className="auth-card fade-up">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              width: 56, height: 56, margin: '0 auto 18px',
              background: 'linear-gradient(135deg, var(--purple), var(--purple-deep))',
              borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(139,92,246,0.40)',
            }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="4" y="13" width="18" height="11" rx="2.5" stroke="white" strokeWidth="2" />
                <path d="M8 13V9a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="13" cy="18.5" r="1.5" fill="white" />
              </svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>Admin Sign In</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Access the AttendX admin dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="label">Username</label>
              <input
                className="input"
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="field" style={{ marginBottom: 22 }}>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-3)', fontSize: 14, padding: 4, lineHeight: 1,
                  }}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error fade-in" style={{ marginBottom: 18 }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ fontSize: 15 }}>
              {loading ? <><span className="spin-anim">◌</span> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.9 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Default credentials</span><br />
              Username:{' '}
              <code style={{ fontFamily: 'var(--mono)', background: 'rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-2)' }}>admin</code>
              {' · '}
              Password:{' '}
              <code style={{ fontFamily: 'var(--mono)', background: 'rgba(255,255,255,0.07)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-2)' }}>admin123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}