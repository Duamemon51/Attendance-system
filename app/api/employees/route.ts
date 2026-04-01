import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import QRCode from 'qrcode';
import crypto from 'crypto';

// GET all employees
export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, employees });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, nic } = body;

    if (!name || !nic) {
      return NextResponse.json(
        { success: false, message: 'Name and NIC required' },
        { status: 400 }
      );
    }

    const existing = await Employee.findOne({ nic });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Employee with this NIC already exists' },
        { status: 400 }
      );
    }

    const qrToken = crypto.randomUUID();

    const qrData = JSON.stringify({ token: qrToken, nic, name });

    const qrCode = await QRCode.toDataURL(qrData);

    const employee = await Employee.create({
      name,
      nic,
      qrCode,
      qrToken,
    });

    return NextResponse.json({ success: true, employee });

  } catch (error: any) {
    console.error('POST ERROR:', error);

    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}