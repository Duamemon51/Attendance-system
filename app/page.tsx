'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="grid-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', top: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="fade-in" style={{ textAlign: 'center', zIndex: 1, padding: '40px 20px', maxWidth: '600px', width: '100%' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 24px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', boxShadow: '0 20px 60px rgba(0,212,255,0.3)' }}>📋</div>
        <h1 style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px' }}>
          <span style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AttendX</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '48px', lineHeight: 1.6 }}>QR Code based Employee Attendance System.<br />Fast, reliable, and paperless.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '32px 24px', borderColor: 'rgba(0,212,255,0.2)', background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(17,24,39,1))' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛡️</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#00d4ff' }}>Admin Panel</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Add employees, generate & manage QR codes</p>
            </div>
          </Link>
          <Link href="/scan" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '32px 24px', borderColor: 'rgba(124,58,237,0.2)', background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(17,24,39,1))' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📷</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: '#a78bfa' }}>Scan QR</h3>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Employees scan QR to mark attendance</p>
            </div>
          </Link>
        </div>
        <Link href="/attendance" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: 'rgba(16,185,129,0.2)', background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(17,24,39,1))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '28px' }}>📊</div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>Attendance Records</h3>
                <p style={{ color: '#64748b', fontSize: '13px' }}>View daily attendance logs and reports</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
