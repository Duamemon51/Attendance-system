'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function tick() {
      const n = new Date();
      setTime(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDate(n.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
        <span className="topbar-chip chip-scan">Employee Portal</span>
      </nav>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center' }}>

        {/* Live clock — only render after mount to avoid hydration mismatch */}
        <div className="fade-up float-anim" style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '28px', padding: '24px 48px', marginBottom: 52,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
          minWidth: 260,
        }}>
          <div style={{
            fontSize: 'clamp(36px,8vw,60px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1,
            fontFamily: 'var(--mono)', fontVariantNumeric: 'tabular-nums',
            background: 'linear-gradient(135deg, #F0EEF8 40%, rgba(240,238,248,0.5))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            {mounted ? time : '——:——:——'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8, letterSpacing: '0.3px', minHeight: 20 }}>
            {mounted ? date : ''}
          </div>
        </div>

        <div className="fade-up fade-up-1" style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          background: 'var(--purple-tint)', border: '1px solid var(--purple-bdr)',
          borderRadius: 'var(--r-full)', padding: '6px 16px',
          fontSize: 12, fontWeight: 600, color: 'var(--purple-text)', marginBottom: 24,
        }}>
          <span className="pulse-anim" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', display: 'inline-block' }} />
          QR Code Attendance System
        </div>

        <h1 className="fade-up fade-up-2" style={{ fontSize: 'clamp(32px,6vw,58px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16 }}>
          Mark your attendance{' '}<span className="grad-main">instantly</span>
        </h1>

        <p className="fade-up fade-up-2" style={{ fontSize: 17, color: 'var(--text-2)', marginBottom: 52, maxWidth: 400, lineHeight: 1.7 }}>
          Scan your QR card and register attendance in seconds — paperless, fast, and reliable.
        </p>

        {/* Action cards */}
        <div className="fade-up fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 560, width: '100%' }}>

          <Link href="/scan" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
              borderRadius: 'var(--r-xl)', padding: '28px 24px', cursor: 'pointer',
              transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(16,185,129,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.07)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.2), transparent)', pointerEvents: 'none' }} />
              <div style={{ width: 48, height: 48, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="#10B981" strokeWidth="2" />
                  <rect x="14" y="2" width="8" height="8" rx="1.5" stroke="#10B981" strokeWidth="2" />
                  <rect x="2" y="14" width="8" height="8" rx="1.5" stroke="#10B981" strokeWidth="2" />
                  <rect x="16.5" y="16.5" width="3.5" height="3.5" rx="0.7" fill="#10B981" />
                  <path d="M16.5 14v2.5M14 16.5h2.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--green-text)', marginBottom: 8, letterSpacing: '-0.3px' }}>Scan QR Code</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>Scan your QR card with the camera to instantly check in or check out</p>
              <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5 }}>
                Start Scanning <span style={{ fontSize: 16 }}>→</span>
              </div>
            </div>
          </Link>

          <Link href="/attendance" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.16)',
              borderRadius: 'var(--r-xl)', padding: '28px 24px', cursor: 'pointer',
              transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(245,158,11,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.07)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.18), transparent)', pointerEvents: 'none' }} />
              <div style={{ width: 48, height: 48, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.22)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M8 4V2M16 4V2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 9h18" stroke="#F59E0B" strokeWidth="2" />
                  <path d="M7 14h4M7 17.5h10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber-text)', marginBottom: 8, letterSpacing: '-0.3px' }}>Attendance Records</h3>
              <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>View today's and past attendance logs in real time</p>
              <div style={{ marginTop: 20, fontSize: 13, fontWeight: 700, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
                View Records <span style={{ fontSize: 16 }}>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="fade-up fade-up-4" style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['⚡ Instant scan', '📱 Any device', '🔒 Secure & reliable', '📊 Real-time logs'].map(f => (
            <span key={f} style={{ fontSize: 12, color: 'var(--text-3)' }}>{f}</span>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>AttendX — QR Attendance System</span>
        <Link href="/admin/login" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none' }}>
          Admin Access →
        </Link>
      </div>
    </div>
  );
}