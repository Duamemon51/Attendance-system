'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Record {
  _id: string;
  employeeName: string;
  employeeNic: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchRecords(); }, [date]);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      if (data.success) setRecords(data.records);
    } catch {}
    finally { setLoading(false); }
  }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function dur(ci: string, co?: string) {
    if (!co) return null;
    const d = new Date(co).getTime() - new Date(ci).getTime();
    return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`;
  }

  return (
    <div className="page">
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
        <span className="topbar-chip chip-record" style={{ marginLeft: 8 }}>Records</span>
        <div className="topbar-spacer" />
        <Link href="/scan" className="topbar-btn" style={{ marginRight: 8 }}>📷 Scan</Link>
        <Link href="/" className="topbar-btn">← Back</Link>
      </nav>

      <div className="container-md" style={{ paddingTop: 36, paddingBottom: 60 }}>

        <div className="fade-up" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.7px', marginBottom: 4 }}>Attendance Records</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { l: 'Total Records', v: records.length, c: 'var(--purple-text)', g: 'rgba(139,92,246,0.10)' },
            { l: 'Present', v: records.filter(r => r.status === 'present').length, c: 'var(--green-text)', g: 'rgba(16,185,129,0.08)' },
            { l: 'Still Inside', v: records.filter(r => !r.checkOut).length, c: 'var(--amber-text)', g: 'rgba(245,158,11,0.08)' },
          ].map(s => (
            <div key={s.l} className="stat" style={{ boxShadow: `0 0 24px ${s.g}` }}>
              <div className="stat-val" style={{ color: s.c }}>{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Date filter */}
        <div className="card fade-up fade-up-2" style={{ marginBottom: 18, padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth: 170 }} />
            <button className="btn btn-ghost btn-sm" onClick={() => setDate(new Date().toISOString().split('T')[0])}>Today</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { const d = new Date(); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0]); }}>Yesterday</button>
            <div style={{ flex: 1 }} />
            <button className="btn btn-ghost btn-sm" onClick={fetchRecords}>↺ Refresh</button>
          </div>
        </div>

        {/* Table */}
        <div className="card-flush fade-up fade-up-3">
          {loading ? (
            <div className="empty">
              <div style={{ width: 28, height: 28, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: 'var(--purple)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', margin: '0 auto 12px' }} />
            </div>
          ) : records.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No records for this date</div>
              <div className="empty-desc">Scan your QR code to register attendance.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>{['#', 'Employee', 'Check In', 'Check Out', 'Duration', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r._id}>
                      <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{r.employeeName}</div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.employeeNic}</div>
                      </td>
                      <td><span style={{ color: 'var(--green-text)', fontWeight: 600 }}>{fmtTime(r.checkIn)}</span></td>
                      <td>{r.checkOut ? <span style={{ color: '#93C5FD', fontWeight: 600 }}>{fmtTime(r.checkOut)}</span> : <span className="badge badge-amber">Active</span>}</td>
                      <td>{dur(r.checkIn, r.checkOut) ? <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>{dur(r.checkIn, r.checkOut)}</span> : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                      <td>{r.checkOut ? <span className="badge badge-green">Complete</span> : <span className="badge badge-amber">Active</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}