import mongoose, { Document, Schema } from 'mongoose';

export interface IVisit extends Document {
  affiliateId: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const visitSchema = new Schema<IVisit>({
  affiliateId: { type: Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVisit>('Visit', visitSchema); 