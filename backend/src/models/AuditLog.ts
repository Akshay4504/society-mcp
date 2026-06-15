import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: Schema.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Schema.Types.ObjectId;
  societyId?: Schema.Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  changes?: {
    before?: any;
    after?: any;
  };
  severity: 'Info' | 'Warning' | 'Critical';
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required']
  },
  action: {
    type: String,
    required: [true, 'Action name is required'],
    trim: true
  },
  resource: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true
  },
  resourceId: {
    type: Schema.Types.ObjectId
  },
  societyId: {
    type: Schema.Types.ObjectId,
    ref: 'Society'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  changes: {
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed }
  },
  severity: {
    type: String,
    enum: {
      values: ['Info', 'Warning', 'Critical'],
      message: '{VALUE} is not a valid severity level'
    },
    default: 'Info'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60 // TTL index: automatically expire logs after 90 days (7776000 seconds)
  }
}, {
  // Write-once append-only log: disable updatedAt timestamp, manage createdAt manually
  timestamps: false
});

// Indexes for audit logs querying
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ societyId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
