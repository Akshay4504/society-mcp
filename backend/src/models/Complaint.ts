import { Schema, model, Document } from 'mongoose';

export interface IComplaint extends Document {
  societyId: Schema.Types.ObjectId;
  raisedBy: Schema.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  status: 'Pending-Approval' | 'Open' | 'Assigned' | 'In-Progress' | 'Resolved' | 'Closed';
  assignedTo?: Schema.Types.ObjectId;
  aiAnalysis: {
    detectedCategory: string;
    confidenceScore: number;
    estimatedPriority: 'Low' | 'Medium' | 'High' | 'Critical';
    sentimentScore: number;
    explanation: string;
  };
  resolutionDetails?: {
    resolvedAt: Date;
    notes: string;
    feedbackRating?: number;
    feedbackComments?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>({
  societyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Society', 
    required: [true, 'Society reference is required'] 
  },
  raisedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Author (User) reference is required'] 
  },
  title: { 
    type: String, 
    required: [true, 'Complaint title is required'], 
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Complaint description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{ 
    type: String,
    trim: true,
    match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, 'Please enter valid image URLs']
  }],
  status: { 
    type: String, 
    enum: {
      values: ['Pending-Approval', 'Open', 'Assigned', 'In-Progress', 'Resolved', 'Closed'],
      message: '{VALUE} is not a valid complaint status'
    },
    default: 'Pending-Approval' 
  },
  assignedTo: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  aiAnalysis: {
    detectedCategory: { 
      type: String, 
      required: [true, 'AI detected category is required'],
      trim: true
    },
    confidenceScore: { 
      type: Number, 
      required: true, 
      default: 1.0,
      min: [0, 'Confidence score cannot be less than 0'],
      max: [1, 'Confidence score cannot be more than 1']
    },
    estimatedPriority: { 
      type: String, 
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: '{VALUE} is not a valid priority level'
      },
      required: true, 
      default: 'Medium' 
    },
    sentimentScore: { 
      type: Number, 
      required: true, 
      default: 0.0,
      min: [-1, 'Sentiment score cannot be less than -1'],
      max: [1, 'Sentiment score cannot be more than 1']
    },
    explanation: { 
      type: String,
      trim: true 
    }
  },
  resolutionDetails: {
    resolvedAt: { type: Date },
    notes: { type: String, trim: true },
    feedbackRating: { 
      type: Number, 
      min: [1, 'Rating must be at least 1'], 
      max: [5, 'Rating cannot exceed 5'] 
    },
    feedbackComments: { type: String, trim: true }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common query operations
ComplaintSchema.index({ societyId: 1, status: 1 });
ComplaintSchema.index({ raisedBy: 1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ 'aiAnalysis.estimatedPriority': 1 });
ComplaintSchema.index({ createdAt: -1 });

export const Complaint = model<IComplaint>('Complaint', ComplaintSchema);
