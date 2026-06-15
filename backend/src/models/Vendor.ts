import { Schema, model, Document } from 'mongoose';

export interface IVendorContract {
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  value: number;
  termsDocumentUrl?: string;
}

export interface IVendorRating {
  rating: number;
  review?: string;
  givenBy: Schema.Types.ObjectId;
  date: Date;
}

export interface IVendor extends Document {
  societyId: Schema.Types.ObjectId;
  name: string;
  category: 'Plumbing' | 'Electrical' | 'Security' | 'Gardening' | 'Cleaning' | 'Other';
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Blacklisted';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  contracts: IVendorContract[];
  ratings: IVendorRating[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const VendorContractSchema = new Schema<IVendorContract>({
  contractNumber: { 
    type: String, 
    required: [true, 'Contract number is required'], 
    trim: true, 
    uppercase: true 
  },
  startDate: { 
    type: Date, 
    required: [true, 'Start date is required'] 
  },
  endDate: { 
    type: Date, 
    required: [true, 'End date is required'] 
  },
  value: { 
    type: Number, 
    required: [true, 'Contract value is required'], 
    min: [0, 'Contract value cannot be negative'] 
  },
  termsDocumentUrl: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

const VendorRatingSchema = new Schema<IVendorRating>({
  rating: { 
    type: Number, 
    required: true, 
    min: [1, 'Rating must be at least 1'], 
    max: [5, 'Rating cannot exceed 5'] 
  },
  review: { 
    type: String, 
    trim: true 
  },
  givenBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

const VendorSchema = new Schema<IVendor>({
  societyId: {
    type: Schema.Types.ObjectId,
    ref: 'Society',
    required: [true, 'Society ID reference is required']
  },
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['Plumbing', 'Electrical', 'Security', 'Gardening', 'Cleaning', 'Other'],
      message: '{VALUE} is not a valid vendor category'
    },
    required: [true, 'Vendor category is required']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vendor email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Vendor phone number is required'],
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Inactive', 'Blacklisted'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Active'
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true }
  },
  contracts: [VendorContractSchema],
  ratings: [VendorRatingSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save hook to automatically calculate average rating from the ratings array
VendorSchema.pre<IVendor>('save', function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const total = this.ratings.reduce((sum, item) => sum + item.rating, 0);
    this.averageRating = Math.round((total / this.ratings.length) * 10) / 10;
  } else {
    this.averageRating = 0;
  }
  next();
});

// Indexes for query optimization
VendorSchema.index({ societyId: 1, category: 1 });
VendorSchema.index({ status: 1 });

export const Vendor = model<IVendor>('Vendor', VendorSchema);
