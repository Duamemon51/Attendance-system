import { NextRequest, NextResponse } from 'next/server';

const ADMINS = [
  { username: 'admin', password: 'admin123', name: 'Administrator' },
];

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
    }
    const admin = ADMINS.find(a => a.username === username && a.password === password);
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
    }
    const token = Buffer.from(`${username}:${Date.now()}:attendx_secret`).toString('base64');
    return NextResponse.json({ success: true, token, name: admin.name });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}