'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Employee {
  _id: string;
  name: string;
  nic: string;
  qrCode: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [name, setName] = useState('');
  const [nic, setNic] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedQR, setSelectedQR] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setAdminName(localStorage.getItem('admin_name') || 'Admin');
    fetchEmployees();
  }, []);

  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    router.push('/admin/login');
  }

  async function fetchEmployees() {
    setFetchLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch { setError('Failed to load employees'); }
    finally { setFetchLoading(false); }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim() || !nic.trim()) { setError('Full name and NIC are required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), nic: nic.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`${name} has been added successfully!`);
        setName(''); setNic('');
        setSelectedQR(data.employee);
        fetchEmployees();
        setTimeout(() => setSuccess(''), 5000);
      } else { setError(data.message || 'Something went wrong'); }
    } catch { setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      setEmployees(prev => prev.filter(e => e._id !== id));
      setDeleteConfirm(null);
      if (selectedQR?._id === id) setSelectedQR(null);
    } catch { setError('Failed to delete employee'); }
  }

  function downloadQR(emp: Employee) {
    const a = document.createElement('a');
    a.download = `QR_${emp.name}_${emp.nic}.png`;
    a.href = emp.qrCode; a.click();
  }

  function printQR(emp: Employee) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>QR — ${emp.name}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Outfit',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0A0A0F}.card{background:#141420;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px 36px;text-align:center;width:300px;box-shadow:0 32px 80px rgba(0,0,0,0.5)}.qr{background:white;border-radius:14px;padding:12px;display:inline-block;margin-bottom:22px;box-shadow:0 0 40px rgba(139,92,246,0.25)}h2{font-size:20px;font-weight:700;color:#F0EEF8;letter-spacing:-0.3px;margin-bottom:5px}.nic{font-family:monospace;font-size:12px;color:rgba(240,238,248,0.4);margin-bottom:18px}.badge{display:inline-block;background:rgba(139,92,246,0.15);color:#C4B5FD;border:1px solid rgba(139,92,246,0.3);font-size:11px;font-weight:700;padding:5px 16px;border-radius:99px;letter-spacing:0.5px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
</head><body><div class="card"><div class="qr"><img src="${emp.qrCode}" width="200" height="200"/></div><h2>${emp.name}</h2><p class="nic">NIC: ${emp.nic}</p><span class="badge">SCAN FOR ATTENDANCE</span></div><script>window.onload=function(){window.print();}<\/script></body></html>`);
    win.document.close();
  }

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) || e.nic.includes(search)
  );

  if (!mounted) return null;

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
        <Link href="/admin/records" className="topbar-btn" style={{ marginRight: 8 }}>📊 Records</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--purple-tint)', border: '1px solid var(--purple-bdr)', color: 'var(--purple-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
            {adminName.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)' }}>{adminName}</span>
          <button className="topbar-btn" onClick={logout} style={{ color: '#FCA5A5', borderColor: 'var(--error-bdr)' }}>Sign Out</button>
        </div>
      </nav>

      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>

        <div className="fade-up" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.7px', marginBottom: 4 }}>Employee Management</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Add employees, generate QR codes, and manage your team.</p>
        </div>

        {/* Stats */}
        <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 30 }}>
          {[
            { label: 'Total Employees', val: employees.length, color: 'var(--purple-text)', glow: 'rgba(139,92,246,0.15)' },
            { label: 'Added This Month', val: employees.filter(e => new Date(e.createdAt).getMonth() === new Date().getMonth()).length, color: 'var(--green-text)', glow: 'rgba(16,185,129,0.12)' },
            { label: 'QR Cards Ready', val: employees.filter(e => !!e.qrCode).length, color: 'var(--amber-text)', glow: 'rgba(245,158,11,0.12)' },
          ].map(s => (
            <div key={s.label} className="stat" style={{ boxShadow: `0 0 30px ${s.glow}` }}>
              <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
              <div className="stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,360px) 1fr', gap: 24, alignItems: 'start' }}>

          {/* Left: Form + QR Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card fade-up fade-up-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                <div style={{ width: 32, height: 32, background: 'var(--purple-tint)', border: '1px solid var(--purple-bdr)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--purple-text)' }}>+</div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Add New Employee</h2>
              </div>
              <form onSubmit={handleAdd}>
                <div className="field">
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="e.g. Ahmed Ali" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 20 }}>
                  <label className="label">NIC Number</label>
                  <input className="input" placeholder="42201-1234567-1" value={nic} onChange={e => setNic(e.target.value)} style={{ fontFamily: 'var(--mono)' }} />
                </div>
                {error && <div className="alert alert-error fade-in" style={{ marginBottom: 14 }}><span>⚠</span> {error}</div>}
                {success && <div className="alert alert-success fade-in" style={{ marginBottom: 14 }}><span>✓</span> {success}</div>}
                <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '12px 20px', fontSize: 14 }}>
                  {loading ? <><span className="spin-anim">◌</span> Generating QR...</> : 'Generate QR Code'}
                </button>
              </form>
            </div>

            {selectedQR && (
              <div className="card fade-in" style={{ borderColor: 'var(--purple-bdr)', boxShadow: '0 0 40px rgba(139,92,246,0.15)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-text)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>QR Code Preview</div>
                <div style={{ textAlign: 'center' }}>
                  <div className="qr-box" style={{ marginBottom: 14 }}>
                    <img src={selectedQR.qrCode} alt="QR" style={{ width: 160, height: 160, display: 'block' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>{selectedQR.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--mono)', marginBottom: 18 }}>{selectedQR.nic}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => downloadQR(selectedQR)}>↓ Download</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => printQR(selectedQR)}>⎙ Print</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Employee list */}
          <div className="fade-up fade-up-3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                All Employees
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--text-3)', padding: '2px 10px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-2)' }}>{employees.length}</span>
              </h2>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Search name or NIC..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, paddingLeft: 34, fontSize: 13 }} />
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 15 }}>⌕</span>
              </div>
            </div>

            <div className="card-flush">
              {fetchLoading ? (
                <div className="empty">
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: 'var(--purple)', borderRadius: '50%', animation: 'spin 0.75s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Loading employees...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">👤</div>
                  <div className="empty-title">{search ? 'No results found' : 'No employees yet'}</div>
                  <div className="empty-desc">{search ? 'Try a different name or NIC' : 'Add your first employee using the form'}</div>
                </div>
              ) : (
                filtered.map((emp, i) => (
                  <div key={emp._id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ background: 'white', borderRadius: 8, padding: 3, flexShrink: 0, boxShadow: '0 0 12px rgba(139,92,246,0.15)' }}>
                      <img src={emp.qrCode} alt="" style={{ width: 46, height: 46, display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{emp.name}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)' }}>{emp.nic}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, opacity: 0.7 }}>
                        Added {new Date(emp.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedQR(emp)}>View QR</button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => downloadQR(emp)} title="Download">↓</button>
                      {deleteConfirm === emp._id ? (
                        <>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id)}>Confirm</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setDeleteConfirm(emp._id)} style={{ color: '#FCA5A5' }}>✕</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}