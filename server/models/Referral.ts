import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  _id: mongoose.Types.ObjectId;
  referrerId: string;
  referredUserId: string;
  status: 'pending' | 'converted';
  creditsAwarded: boolean;
  purchaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    referrerId: {
      type: String,
      required: true,
      ref: 'User',
    },
    referredUserId: {
      type: String,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'converted'],
      default: 'pending',
    },
    creditsAwarded: {
      type: Boolean,
      default: false,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);