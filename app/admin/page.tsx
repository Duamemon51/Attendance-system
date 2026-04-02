'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Employee {
  _id: string;
  name: string;
  nic: string;
  qrCode: string;
  createdAt: string;
}

export default function AdminPage() {
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

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees() {
    setFetchLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) setEmployees(data.employees);
    } catch { setError('Failed to load employees'); }
    finally { setFetchLoading(false); }
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!name.trim() || !nic.trim()) { setError('Name aur NIC dono required hain'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), nic: nic.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`${name} add ho gaya!`);
        setName(''); setNic('');
        setSelectedQR(data.employee);
        fetchEmployees();
      } else { setError(data.message || 'Kuch error aya'); }
    } catch { setError('Server se connect nahi ho saka'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      setEmployees(prev => prev.filter(e => e._id !== id));
      setDeleteConfirm(null);
      if (selectedQR?._id === id) setSelectedQR(null);
    } catch { setError('Delete nahi ho saka'); }
  }

  function downloadQR(emp: Employee) {
    const link = document.createElement('a');
    link.download = `QR_${emp.name}_${emp.nic}.png`;
    link.href = emp.qrCode;
    link.click();
  }

  function printQR(emp: Employee) {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>QR — ${emp.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'DM Sans',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F7F6F3}
      .card{background:white;border-radius:20px;padding:36px 32px;text-align:center;max-width:300px;border:1px solid #e5e3de;box-shadow:0 8px 32px rgba(0,0,0,0.08)}
      .qr-wrap{background:white;border-radius:12px;padding:12px;display:inline-block;border:1px solid #e5e3de;margin-bottom:20px}
      h2{font-size:20px;font-weight:600;color:#0F0E0C;margin-bottom:4px;letter-spacing:-0.3px}
      .nic{font-size:13px;color:#6B6760;font-family:'DM Mono',monospace;margin-bottom:16px}
      .badge{display:inline-block;background:#EAE8FA;color:#4A3F9F;font-size:11px;font-weight:600;padding:5px 14px;border-radius:99px;letter-spacing:0.5px}
      @media print{body{background:white}.card{box-shadow:none;border:none}}
    </style></head>
    <body>
      <div class="card">
        <div class="qr-wrap"><img src="${emp.qrCode}" width="200" height="200" /></div>
        <h2>${emp.name}</h2>
        <p class="nic">NIC: ${emp.nic}</p>
        <span class="badge">SCAN FOR ATTENDANCE</span>
      </div>
      <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`);
    win.document.close();
  }

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.nic.includes(search)
  );

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>

      {/* ── Topbar ── */}
      <nav className="topbar">
        <div className="topbar-logomark" style={{ textDecoration: 'none' }}>
          <svg viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.5)" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>
        <span className="topbar-name" style={{ marginLeft: 10 }}>Attend<em>X</em></span>
        <div style={{
          marginLeft: 10, fontSize: 11, fontWeight: 600, color: 'var(--purple)',
          background: 'var(--purple-light)', padding: '3px 10px', borderRadius: 99,
          letterSpacing: '0.3px'
        }}>ADMIN</div>
        <div className="topbar-spacer" />
        <Link href="/attendance" className="topbar-back" style={{ marginRight: 8 }}>
          📊 Records
        </Link>
        <Link href="/" className="topbar-back">← Back</Link>
      </nav>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Page title */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.5px', marginBottom: 4 }}>
            Employee Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Add employees, generate QR codes, and manage your workforce.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 360px) 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Add Employee Form */}
            <div className="card fade-up fade-up-1">
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 28, height: 28, background: 'var(--purple-light)', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>+</span>
                Add New Employee
              </h2>

              <form onSubmit={handleAddEmployee}>
                <div style={{ marginBottom: 14 }}>
                  <label className="label">Employee Name</label>
                  <input
                    className="input"
                    placeholder="e.g. Ahmed Ali"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="label">NIC Number</label>
                  <input
                    className="input"
                    placeholder="e.g. 42201-1234567-1"
                    value={nic}
                    onChange={e => setNic(e.target.value)}
                    style={{ fontFamily: 'var(--mono)' }}
                  />
                </div>

                {error && (
                  <div className="alert alert-error" style={{ marginBottom: 14 }}>
                    <span>⚠</span> {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success" style={{ marginBottom: 14 }}>
                    <span>✓</span> {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                  style={{ fontSize: 14, padding: '11px 20px' }}
                >
                  {loading ? (
                    <><span className="spin">◌</span> Generating QR...</>
                  ) : (
                    <>Generate QR Code</>
                  )}
                </button>
              </form>
            </div>

            {/* QR Preview */}
            {selectedQR && (
              <div className="card fade-up" style={{ borderColor: 'rgba(74,63,159,0.25)', borderWidth: 1.5 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--purple)' }}>
                  QR Code Preview
                </h3>
                <div style={{ textAlign: 'center' }}>
                  <div className="qr-wrap" style={{ marginBottom: 14 }}>
                    <img
                      src={selectedQR.qrCode}
                      alt="QR Code"
                      style={{ width: 168, height: 168, display: 'block' }}
                    />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 2 }}>{selectedQR.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--mono)', marginBottom: 18 }}>
                    {selectedQR.nic}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => downloadQR(selectedQR)}
                    >
                      ↓ Download
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => printQR(selectedQR)}
                    >
                      ⎙ Print
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Employee List ── */}
          <div className="fade-up fade-up-2">
            {/* Header + Search */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>
                Employees
                <span style={{
                  marginLeft: 8, background: 'var(--surface-2)', color: 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 99,
                  border: '1px solid var(--border)'
                }}>{employees.length}</span>
              </h2>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  placeholder="Search name or NIC..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: 220, paddingLeft: 32, fontSize: 13 }}
                />
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 13 }}>⌕</span>
              </div>
            </div>

            <div className="card-flush">
              {fetchLoading ? (
                <div className="empty-state">
                  <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.3 }}>◌</div>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>Loading employees...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <div className="empty-title">{search ? 'No results found' : 'No employees yet'}</div>
                  <div className="empty-desc">{search ? 'Try a different name or NIC' : 'Add your first employee using the form.'}</div>
                </div>
              ) : (
                <div>
                  {filtered.map((emp, i) => (
                    <div
                      key={emp._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 20px',
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* QR thumbnail */}
                      <div style={{ background: 'white', borderRadius: 8, padding: 4, border: '1px solid var(--border)', flexShrink: 0 }}>
                        <img src={emp.qrCode} alt="" style={{ width: 44, height: 44, display: 'block' }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2, color: 'var(--text-primary)' }}>
                          {emp.name}
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-secondary)' }}>
                          {emp.nic}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          Added {new Date(emp.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedQR(emp)}
                          title="View QR"
                        >
                          View QR
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => downloadQR(emp)}
                          title="Download"
                        >
                          ↓
                        </button>
                        {deleteConfirm === emp._id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(emp._id)}
                              style={{ fontSize: 12 }}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => setDeleteConfirm(emp._id)}
                            style={{ color: 'var(--red)' }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}