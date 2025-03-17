import mongoose, { Document, Schema } from 'mongoose';

export interface ICase extends Document {
  affiliateId: mongoose.Types.ObjectId;
  status: 'pending' | 'won' | 'lost';
  flightNumber: string;
  airline: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>({
  affiliateId: { type: Schema.Types.ObjectId, ref: 'Affiliate', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'won', 'lost'],
    default: 'pending'
  },
  flightNumber: { type: String, required: true },
  airline: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

caseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICase>('Case', caseSchema); 