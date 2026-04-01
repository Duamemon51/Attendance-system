import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  nic: string;
  qrCode: string;
  qrToken: string;
  createdAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true, trim: true },
  nic: { type: String, required: true, unique: true, trim: true },
  qrCode: { type: String, required: true },
  qrToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
