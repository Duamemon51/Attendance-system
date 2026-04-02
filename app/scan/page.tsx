'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ScanResult {
  success: boolean;
  action?: 'checkin' | 'checkout';
  message: string;
  employee?: { name: string; nic: string };
  time?: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<any>(null);

  useEffect(() => () => { stopScanner(); }, []);

  async function startScanner() {
    setResult(null);
    setScanning(true);
    const { Html5Qrcode } = await import('html5-qrcode');
    const qr = new Html5Qrcode('qr-reader');
    scannerRef.current = qr;
    try {
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (text: string) => {
          if (processing) return;
          setProcessing(true);
          await stopScanner();
          await processQR(text);
          setProcessing(false);
        },
        undefined
      );
    } catch {
      setScanning(false);
      setResult({ success: false, message: 'Camera access denied. Please allow camera permission in your browser settings.' });
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function processQR(text: string) {
    try {
      let token = text;
      try { const p = JSON.parse(text); token = p.token; } catch {}
      const res = await fetch('/api/scan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      setResult(await res.json());
    } catch {
      setResult({ success: false, message: 'Unable to connect to the server. Please try again.' });
    }
  }

  const rc = result?.success ? (result.action === 'checkin' ? 'var(--green-text)' : 'var(--purple-text)') : '#FCA5A5';
  const rbg = result?.success ? (result.action === 'checkin' ? 'var(--green-tint)' : 'var(--purple-tint)') : 'var(--error-bg)';
  const rbdr = result?.success ? (result.action === 'checkin' ? 'var(--green-bdr)' : 'var(--purple-bdr)') : 'var(--error-bdr)';

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
        <span className="topbar-chip chip-scan" style={{ marginLeft: 8 }}>QR Scanner</span>
        <div className="topbar-spacer" />
        <Link href="/" className="topbar-btn">← Back</Link>
      </nav>

      <div className="container-sm" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.7px', marginBottom: 10 }}>QR Scanner</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 15 }}>Hold your QR card in front of the camera to mark attendance</p>
        </div>

        <div className="card fade-up fade-up-1" style={{ padding: 28 }}>

          {/* Idle */}
          {!result && !scanning && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 'var(--r-xl)', padding: '56px 20px', marginBottom: 24, background: 'rgba(255,255,255,0.02)' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ display: 'block', margin: '0 auto 14px', opacity: 0.25 }}>
                  <rect x="4" y="4" width="20" height="20" rx="3" stroke="white" strokeWidth="2.5" />
                  <rect x="32" y="4" width="20" height="20" rx="3" stroke="white" strokeWidth="2.5" />
                  <rect x="4" y="32" width="20" height="20" rx="3" stroke="white" strokeWidth="2.5" />
                  <rect x="36" y="36" width="8" height="8" rx="1.5" fill="white" />
                  <path d="M36 32v4M32 36h4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 4, fontWeight: 500 }}>Camera is off</p>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Press the button below to start scanning</p>
              </div>
              <button className="btn btn-green btn-full btn-lg" onClick={startScanner}>
                ▶ Start Scanning
              </button>
            </div>
          )}

          {/* Scanning */}
          {!result && scanning && (
            <div>
              <div id="qr-reader" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '2px solid var(--green)', marginBottom: 20, minHeight: 300, boxShadow: '0 0 30px rgba(16,185,129,0.20)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20, color: 'var(--green-text)', fontSize: 13 }}>
                <span className="pulse-anim" style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                Hold your QR card in front of the camera...
              </div>
              <button className="btn btn-outline btn-full" onClick={stopScanner}>⏹ Stop Scanning</button>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="fade-in" style={{ textAlign: 'center' }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', background: rbg, border: `2px solid ${rbdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 30, color: rc, fontWeight: 700, boxShadow: `0 0 30px ${rbg}` }}>
                {result.success ? (result.action === 'checkin' ? '✓' : '↩') : '✕'}
              </div>

              <div style={{ background: rbg, border: `1px solid ${rbdr}`, borderRadius: 'var(--r-lg)', padding: '22px', marginBottom: 24, textAlign: 'left' }}>
                <p style={{ fontWeight: 700, fontSize: 18, color: rc, textAlign: 'center', marginBottom: 8 }}>
                  {result.success ? (result.action === 'checkin' ? 'Check-In Successful!' : 'Check-Out Successful!') : 'Scan Failed'}
                </p>
                <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', marginBottom: result.employee ? 16 : 0 }}>{result.message}</p>

                {result.employee && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--r-md)', border: `1px solid ${rbdr}`, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { l: 'Name', v: result.employee.name },
                      { l: 'NIC', v: result.employee.nic, mono: true },
                      { l: 'Time', v: result.time, accent: rc },
                    ].map(row => (
                      <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{row.l}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: row.mono ? 'var(--mono)' : 'inherit', color: row.accent || 'var(--text-1)' }}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button className="btn btn-green" onClick={() => setResult(null)} style={{ padding: '12px' }}>↺ Scan Again</button>
                <Link href="/attendance" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-ghost btn-full" style={{ padding: '12px' }}>📊 View Records</button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        {!result && !scanning && (
          <div className="card fade-up fade-up-2" style={{ marginTop: 16, background: 'rgba(255,255,255,0.02)' }}>
            <div className="section-label">How it works</div>
            {[
              ['1', 'Press "Start Scanning" button'],
              ['2', 'Allow camera permission in your browser'],
              ['3', 'Hold your QR card in front of the camera'],
              ['4', 'Attendance will be registered automatically'],
            ].map(([n, t]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--green-tint)', border: '1px solid var(--green-bdr)', color: 'var(--green-text)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{t}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}