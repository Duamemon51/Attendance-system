import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AttendX - Employee Attendance System',
  description: 'QR Code based employee attendance management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
