import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AttendX — Smart Attendance',
  description: 'QR Code Employee Attendance System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="ambient">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="grid-texture" />
        {children}
      </body>
    </html>
  );
}