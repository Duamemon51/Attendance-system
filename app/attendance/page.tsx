'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AttendanceRecord {
  _id: string;
  employeeName: string;
  employeeNic: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
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

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function calcDuration(checkIn: string, checkOut?: string) {
    if (!checkOut) return '—';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  }

  const presentCount = records.filter(r => r.status === 'present').length;

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div className="glass" style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📊</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px' }}>Attendance Records</span>
          </div>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: '14px' }}>← Back</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '80px' }}>
        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Records', value: records.length, color: '#00d4ff', icon: '📋' },
            { label: 'Present', value: presentCount, color: '#10b981', icon: '✅' },
            { label: 'Checked Out', value: records.filter(r => r.checkOut).length, color: '#a78bfa', icon: '👋' },
          ].map(s => (
            <div key={s.label} className="card fade-in" style={{ textAlign: 'center', borderColor: `${s.color}22` }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Date Filter */}
        <div className="card fade-in" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>📅 Date Filter:</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button onClick={() => setDate(new Date().toISOString().split('T')[0])} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
            Today
          </button>
          <button onClick={fetchRecords} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
            🔄 Refresh
          </button>
        </div>

        {/* Table */}
        <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2d45', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Records — {new Date(date + 'T00:00:00').toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <span className="badge-success">{presentCount} Present</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>⏳ Loading...</div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <p>Is din ka koi record nahi mila</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(26,34,53,0.8)' }}>
                    {['#', 'Employee', 'NIC', 'Check In', 'Check Out', 'Duration', 'Status'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec, i) => (
                    <tr key={rec._id} style={{ borderTop: '1px solid #1e2d45', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '16px 20px', color: '#475569', fontSize: '13px' }}>{i + 1}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{rec.employeeName}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px', fontFamily: 'monospace' }}>{rec.employeeNic}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '14px' }}>{formatTime(rec.checkIn)}</span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {rec.checkOut
                          ? <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '14px' }}>{formatTime(rec.checkOut)}</span>
                          : <span style={{ color: '#f59e0b', fontSize: '13px' }}>Still In</span>
                        }
                      </td>
                      <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px' }}>{calcDuration(rec.checkIn, rec.checkOut)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className={rec.checkOut ? 'badge-success' : 'badge-warning'}>
                          {rec.checkOut ? 'Complete' : 'Checked In'}
                        </span>
                      </td>
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
