import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAffiliate extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  bankName?: string;
  bankAccount?: string;
  bankAgency?: string;
  bankType?: string;
  pixKey?: string;
  referralCode: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const affiliateSchema = new Schema<IAffiliate>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  country: {
    type: String
  },
  bankName: {
    type: String
  },
  bankAccount: {
    type: String
  },
  bankAgency: {
    type: String
  },
  bankType: {
    type: String
  },
  pixKey: {
    type: String
  },
  referralCode: {
    type: String,
    required: true,
    unique: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
affiliateSchema.pre('save', async function(next: (err?: Error) => void) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
affiliateSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAffiliate>('Affiliate', affiliateSchema); 