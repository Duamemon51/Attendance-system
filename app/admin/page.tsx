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
    if (!name.trim() || !nic.trim()) { setError('Name aur NIC required hain'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), nic: nic.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`${name} ka QR Code generate ho gaya!`);
        setName(''); setNic('');
        setSelectedQR(data.employee);
        fetchEmployees();
      } else { setError(data.message || 'Error aya'); }
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
    win.document.write(`<html><head><title>QR - ${emp.name}</title><style>body{font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff}.card{text-align:center;border:2px solid #e2e8f0;border-radius:16px;padding:32px;max-width:320px}h2{font-size:22px;margin:16px 0 4px;color:#0f172a}p{color:#64748b;font-size:13px;margin:0}img{border-radius:12px}.badge{background:#f1f5f9;border-radius:8px;padding:8px 16px;margin-top:12px;display:inline-block;font-size:12px;color:#475569;font-weight:600;letter-spacing:1px}</style></head><body><div class="card"><div style="font-size:40px">🏢</div><img src="${emp.qrCode}" width="200" height="200"/><h2>${emp.name}</h2><p>NIC: ${emp.nic}</p><div class="badge">SCAN FOR ATTENDANCE</div></div></body></html>`);
    win.document.close();
    win.print();
  }

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div className="glass" style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🛡️</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px' }}>Admin Panel</span>
          </div>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: '14px' }}>← Back</Link>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 400px) 1fr', gap: '24px', alignItems: 'start' }}>

          {/* Form + QR Preview */}
          <div>
            <div className="card fade-in" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>➕ Naya Employee</h2>
              <form onSubmit={handleAddEmployee}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee Name</label>
                  <input className="input" placeholder="e.g. Ahmed Ali" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIC Number</label>
                  <input className="input" placeholder="e.g. 42201-1234567-1" value={nic} onChange={e => setNic(e.target.value)} />
                </div>
                {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '14px', color: '#ef4444', fontSize: '13px' }}>⚠️ {error}</div>}
                {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '14px', color: '#10b981', fontSize: '13px' }}>✅ {success}</div>}
                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? '⏳ Generating...' : '🔲 Generate QR Code'}
                </button>
              </form>
            </div>

            {selectedQR && (
              <div className="card fade-in" style={{ borderColor: 'rgba(0,212,255,0.3)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#00d4ff' }}>🔲 QR Code Preview</h3>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '12px', display: 'inline-block', marginBottom: '12px' }}>
                    <img src={selectedQR.qrCode} alt="QR" style={{ width: '180px', height: '180px', display: 'block' }} />
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '2px' }}>{selectedQR.name}</p>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>{selectedQR.nic}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => downloadQR(selectedQR)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>⬇️ Download</button>
                    <button onClick={() => printQR(selectedQR)} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>🖨️ Print</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Employee List */}
          <div className="card fade-in">
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>👥 Employees ({employees.length})</h2>
            {fetchLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>⏳ Loading...</div>
            ) : employees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                <p>Koi employee nahi. Pehle employee add karo.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {employees.map(emp => (
                  <div key={emp._id} style={{ background: 'rgba(26,34,53,0.8)', border: '1px solid #1e2d45', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2d45')}>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '4px', flexShrink: 0 }}>
                      <img src={emp.qrCode} alt="QR" style={{ width: '52px', height: '52px', display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{emp.name}</p>
                      <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>🪪 {emp.nic}</p>
                      <p style={{ color: '#475569', fontSize: '11px' }}>{new Date(emp.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => setSelectedQR(emp)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>View QR</button>
                      <button onClick={() => downloadQR(emp)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>⬇️</button>
                      {deleteConfirm === emp._id ? (
                        <>
                          <button onClick={() => handleDelete(emp._id)} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Sure?</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid #1e2d45', color: '#64748b', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>No</button>
                        </>
                      ) : (
                        <button onClick={() => setDeleteConfirm(emp._id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
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
  );
}
