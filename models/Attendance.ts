import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  employeeNic: string;
  date: string;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent';
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  employeeNic: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
});

// Prevent duplicate check-in on same day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
