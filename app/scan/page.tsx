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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { return () => { stopScanner(); }; }, []);

  async function startScanner() {
    setResult(null);
    setScanning(true);
    // Dynamically import html5-qrcode
    const { Html5Qrcode } = await import('html5-qrcode');
    const qrScanner = new Html5Qrcode('qr-reader');
    scannerRef.current = qrScanner;

    try {
      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText: string) => {
          if (processing) return;
          setProcessing(true);
          await stopScanner();
          await processQR(decodedText);
          setProcessing(false);
        },
        undefined
      );
    } catch (err) {
      setScanning(false);
      setResult({ success: false, message: 'Camera access nahi mila. Permission check karo.' });
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }

  async function processQR(text: string) {
    try {
      let token = text;
      // Try parsing JSON (our QR format)
      try {
        const parsed = JSON.parse(text);
        token = parsed.token;
      } catch {}

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: 'Server se connect nahi ho saka.' });
    }
  }

  function reset() {
    setResult(null);
    setScanning(false);
  }

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: '24px' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div className="glass" style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📷</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '18px' }}>QR Scanner</span>
          </div>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: '14px' }}>← Back</Link>
        </div>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', paddingTop: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Attendance Scanner</h1>
          <p style={{ color: '#64748b' }}>QR code scan karke apni attendance lagao</p>
        </div>

        <div className="card fade-in">
          {/* Scanner area */}
          {!result && (
            <>
              <div id="qr-reader" ref={containerRef} style={{
                borderRadius: '12px', overflow: 'hidden',
                border: scanning ? '2px solid rgba(0,212,255,0.5)' : '2px solid #1e2d45',
                marginBottom: '20px',
                display: scanning ? 'block' : 'none',
                transition: 'border-color 0.3s',
                minHeight: '300px',
              }} />

              {!scanning && (
                <div style={{
                  border: '2px dashed #1e2d45', borderRadius: '12px', padding: '60px 40px',
                  textAlign: 'center', marginBottom: '20px',
                  background: 'rgba(26,34,53,0.5)'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
                  <p style={{ color: '#64748b', marginBottom: '8px' }}>Camera band hai</p>
                  <p style={{ color: '#475569', fontSize: '13px' }}>Scan shuru karne ke liye button dabao</p>
                </div>
              )}

              <button
                onClick={scanning ? stopScanner : startScanner}
                className="btn-primary"
                style={{ width: '100%', fontSize: '16px', padding: '16px' }}
              >
                {scanning ? '⏹️ Scan Band Karo' : '▶️ Scan Shuru Karo'}
              </button>

              {scanning && (
                <div style={{ textAlign: 'center', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#00d4ff', fontSize: '14px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00d4ff', animation: 'pulse 1.5s infinite' }} />
                  QR code camera ke saamne rakhein...
                </div>
              )}
            </>
          )}

          {/* Result */}
          {result && (
            <div className="fade-in" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '72px', marginBottom: '16px' }}>
                {result.success ? (result.action === 'checkin' ? '✅' : '👋') : '❌'}
              </div>

              <div style={{
                background: result.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '16px', padding: '24px', marginBottom: '24px'
              }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: result.success ? '#10b981' : '#ef4444' }}>
                  {result.success ? (result.action === 'checkin' ? 'Check-In Successful!' : 'Check-Out Successful!') : 'Error!'}
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: result.employee ? '16px' : '0' }}>{result.message}</p>

                {result.employee && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>Name</span>
                      <span style={{ fontWeight: 600 }}>{result.employee.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>NIC</span>
                      <span style={{ fontWeight: 600 }}>{result.employee.nic}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: '13px' }}>Time</span>
                      <span style={{ fontWeight: 600, color: '#00d4ff' }}>{result.time}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={reset} className="btn-primary">
                  🔄 Dobara Scan
                </button>
                <Link href="/attendance" style={{ textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: 'rgba(100,116,139,0.1)', border: '1px solid #1e2d45', color: '#94a3b8', borderRadius: '10px', padding: '12px', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '14px' }}>
                    📊 Records
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!result && !scanning && (
          <div className="card fade-in" style={{ marginTop: '20px', background: 'rgba(17,24,39,0.5)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Tareeqa</h3>
            {[
              ['1️⃣', 'Scan Shuru Karo button dabao'],
              ['2️⃣', 'Camera permission allow karo'],
              ['3️⃣', 'Apna QR card camera ke saamne rakhein'],
              ['4️⃣', 'Check-in/out automatically register ho jaegi'],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '18px' }}>{icon}</span>
                <span style={{ color: '#64748b', fontSize: '14px' }}>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
