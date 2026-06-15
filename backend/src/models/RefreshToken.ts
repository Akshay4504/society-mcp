import { Schema, model, Document } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required']
  },
  token: {
    type: String,
    required: [true, 'Token string is required'],
    unique: true
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    index: { expires: 0 } // TTL index: document will expire and be deleted automatically at 'expiresAt'
  }
}, { timestamps: true });

export const RefreshToken = model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
