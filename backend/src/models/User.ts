import { Schema, model, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: 'SuperAdmin' | 'SocietyAdmin' | 'ResidentOwner' | 'ResidentTenant' | 'Staff' | 'Vendor';
  societyId: Schema.Types.ObjectId | null;
  flatDetails?: {
    block: string;
    flatNumber: string;
    areaSqFt: number;
    occupancyStatus: 'occupied' | 'vacant' | 'rented';
  };
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: Date;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'], 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
  },
  passwordHash: { 
    type: String, 
    required: [true, 'Password hash is required'] 
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, 'Please fill a valid phone number']
  },
  role: { 
    type: String, 
    enum: {
      values: ['SuperAdmin', 'SocietyAdmin', 'ResidentOwner', 'ResidentTenant', 'Staff', 'Vendor'],
      message: '{VALUE} is not a valid user role'
    },
    required: [true, 'User role is required'] 
  },
  societyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Society', 
    default: null 
  },
  flatDetails: {
    block: { type: String, trim: true },
    flatNumber: { type: String, trim: true },
    areaSqFt: { type: Number, min: [0, 'Area cannot be negative'] },
    occupancyStatus: { type: String, enum: ['occupied', 'vacant', 'rented'] }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  twoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  twoFactorSecret: { 
    type: String,
    trim: true
  },
  lastLogin: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      const { passwordHash, twoFactorSecret, ...sanitized } = ret;
      return sanitized;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      const { passwordHash, twoFactorSecret, ...sanitized } = ret;
      return sanitized;
    }
  }
});

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcryptjs.genSalt(12);
    this.passwordHash = await bcryptjs.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password helper method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcryptjs.compare(password, this.passwordHash);
};

// Indexing for performance and query optimization
UserSchema.index({ societyId: 1, 'flatDetails.block': 1, 'flatDetails.flatNumber': 1 });

export const User = model<IUser>('User', UserSchema);
