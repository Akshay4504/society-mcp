import { Schema, model, Document } from 'mongoose';

export interface INotice extends Document {
  societyId: Schema.Types.ObjectId;
  authorId: Schema.Types.ObjectId;
  title: string;
  content: string;
  category: 'General' | 'Financial' | 'Emergency' | 'Event';
  attachments?: string[];
  translations?: {
    languageCode: string;
    title: string;
    content: string;
  }[];
  isPinned: boolean;
  targetAudience: 'All' | 'Owners' | 'Tenants' | 'Staff';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>({
  societyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Society', 
    required: [true, 'Society reference is required'] 
  },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Author (User) reference is required'] 
  },
  title: { 
    type: String, 
    required: [true, 'Notice title is required'], 
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: { 
    type: String, 
    required: [true, 'Notice content is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    enum: {
      values: ['General', 'Financial', 'Emergency', 'Event'],
      message: '{VALUE} is not a valid notice category'
    },
    default: 'General' 
  },
  attachments: [{
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, 'Please enter valid attachment URLs']
  }],
  translations: [{
    languageCode: { type: String, required: [true, 'Language code is required'], trim: true },
    title: { type: String, required: [true, 'Translated title is required'], trim: true },
    content: { type: String, required: [true, 'Translated content is required'], trim: true }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  targetAudience: {
    type: String,
    enum: {
      values: ['All', 'Owners', 'Tenants', 'Staff'],
      message: '{VALUE} is not a valid target audience'
    },
    default: 'All'
  },
  expiresAt: { 
    type: Date 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for query optimization
NoticeSchema.index({ societyId: 1, isPinned: -1, createdAt: -1 });
NoticeSchema.index({ expiresAt: 1 });

export const Notice = model<INotice>('Notice', NoticeSchema);
