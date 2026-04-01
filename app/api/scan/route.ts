import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Invalid QR Code' }, { status: 400 });
    }

    // Find employee by token
    const employee = await Employee.findOne({ qrToken: token });
    if (!employee) {
      return NextResponse.json({ success: false, message: 'Employee not found. Invalid QR Code.' }, { status: 404 });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Check if already checked in today
    const existing = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (existing && !existing.checkOut) {
      // Mark checkout
      existing.checkOut = now;
      await existing.save();
      return NextResponse.json({
        success: true,
        action: 'checkout',
        message: `Check-Out successful! Goodbye ${employee.name}`,
        employee: { name: employee.name, nic: employee.nic },
        time: now.toLocaleTimeString('en-PK'),
      });
    }

    if (existing && existing.checkOut) {
      return NextResponse.json({
        success: false,
        message: `${employee.name} already completed attendance for today.`,
      }, { status: 400 });
    }

    // First scan - Check In
    await Attendance.create({
      employeeId: employee._id,
      employeeName: employee.name,
      employeeNic: employee.nic,
      date: today,
      checkIn: now,
      status: 'present',
    });

    return NextResponse.json({
      success: true,
      action: 'checkin',
      message: `Check-In successful! Welcome ${employee.name}`,
      employee: { name: employee.name, nic: employee.nic },
      time: now.toLocaleTimeString('en-PK'),
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
