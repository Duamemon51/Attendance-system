'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AdminRecords() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/admin/login'); return; }
    setAdminName(localStorage.getItem('admin_name') || 'Admin');
    // Set date only on client to avoid SSR mismatch
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (date) loadRecords();
  }, [date]);

  async function loadRecords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?date=${date}`);
      const data = await res.json();
      if (data.success) setRecords(data.records);
    } catch {}
    finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    router.push('/admin/login');
  }

  function setToday() { setDate(new Date().toISOString().split('T')[0]); }
  function setYesterday() { const d = new Date(); d.setDate(d.getDate() - 1); setDate(d.toISOString().split('T')[0]); }

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  function calcDur(ci: string, co?: string) {
    if (!co) return null;
    const d = new Date(co).getTime() - new Date(ci).getTime();
    return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`;
  }

  const filtered = records.filter(r =>
    r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.employeeNic.includes(search)
  );
  const stats = {
    total: records.length,
    present: records.filter(r => r.status === 'present').length,
    completed: records.filter(r => r.checkOut).length,
    active: records.filter(r => !r.checkOut).length,
  };

  if (!mounted) return null;

  const dateLabel = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

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
        <span className="topbar-chip chip-admin" style={{ marginLeft: 8 }}>Admin Panel</span>
        <div className="topbar-spacer" />
        <Link href="/admin/dashboard" className="topbar-btn" style={{ marginRight: 8 }}>👥 Employees</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-tint)', border: '1px solid var(--purple-bdr)', color: 'var(--purple-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
          <button className="topbar-btn" onClick={logout} style={{ color: '#FCA5A5', borderColor: 'var(--error-bdr)' }}>Sign Out</button>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>

        <div className="fade-up" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.7px', marginBottom: 4 }}>Attendance Records</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>{dateLabel}</p>
        </div>

        {/* Stats */}
        <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { l: 'Total Records', v: stats.total, c: 'var(--purple-text)', g: 'rgba(139,92,246,0.12)' },
            { l: 'Present', v: stats.present, c: 'var(--green-text)', g: 'rgba(16,185,129,0.10)' },
            { l: 'Completed', v: stats.completed, c: '#93C5FD', g: 'rgba(147,197,253,0.10)' },
            { l: 'Still Inside', v: stats.active, c: 'var(--amber-text)', g: 'rgba(245,158,11,0.10)' },
          ].map(s => (
            <div key={s.l} className="stat" style={{ boxShadow: `0 0 24px ${s.g}` }}>
              <div className="stat-val" style={{ color: s.c }}>{s.v}</div>
              <div className="stat-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card fade-up fade-up-2" style={{ marginBottom: 18, padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date:</span>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ maxWidth: 170 }} />
            <button className="btn btn-ghost btn-sm" onClick={setToday}>Today</button>
            <button className="btn btn-ghost btn-sm" onClick={setYesterday}>Yesterday</button>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative' }}>
              <input className="input" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 210, paddingLeft: 34, fontSize: 13 }} />
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 15 }}>⌕</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={loadRecords}>↺ Refresh</button>
          </div>
        </div>

        {/* Table */}
        <div className="card-flush fade-up fade-up-3">
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 14, fontWeight: 700 }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {stats.completed > 0 && <span className="badge badge-green">{stats.completed} Completed</span>}
              {stats.active > 0 && <span className="badge badge-amber">{stats.active} Active</span>}
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <div style={{ width: 30, height: 30, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: 'var(--purple)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              <div className="empty-title">{search ? 'No results found' : 'No records for this date'}</div>
              <div className="empty-desc">{search ? 'Try a different search term' : 'No attendance scans recorded on this day.'}</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>{['#', 'Employee', 'NIC', 'Check In', 'Check Out', 'Duration', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const d = calcDur(r.checkIn, r.checkOut);
                    return (
                      <tr key={r._id}>
                        <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{i + 1}</td>
                        <td><span style={{ fontWeight: 600 }}>{r.employeeName}</span></td>
                        <td><span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-3)' }}>{r.employeeNic}</span></td>
                        <td><span style={{ color: 'var(--green-text)', fontWeight: 600 }}>{fmtTime(r.checkIn)}</span></td>
                        <td>{r.checkOut ? <span style={{ color: '#93C5FD', fontWeight: 600 }}>{fmtTime(r.checkOut)}</span> : <span className="badge badge-amber">Active</span>}</td>
                        <td>{d ? <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-2)' }}>{d}</span> : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                        <td>{r.checkOut ? <span className="badge badge-green">Complete</span> : <span className="badge badge-amber">Active</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}