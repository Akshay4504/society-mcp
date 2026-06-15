import { Schema, model, Document } from 'mongoose';

export interface IAsset extends Document {
  societyId: Schema.Types.ObjectId;
  name: string;
  type: string;
  installationDate: Date;
  status: 'Operational' | 'Under-Maintenance' | 'Critical-Failure';
  lastServiceDate: Date;
  nextScheduledService: Date;
  telemetryLogs?: {
    timestamp: Date;
    vibrationLevel?: number;
    temperatureCelsius?: number;
    operatingHours?: number;
  }[];
  aiPredictiveModel?: {
    anomalyDetected: boolean;
    failureRiskScore: number;
    recommendedAction: string;
    nextPredictedFailureDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>({
  societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  installationDate: { type: Date, required: true },
  status: { type: String, enum: ['Operational', 'Under-Maintenance', 'Critical-Failure'], default: 'Operational' },
  lastServiceDate: { type: Date, required: true },
  nextScheduledService: { type: Date, required: true },
  telemetryLogs: [{
    timestamp: { type: Date, default: Date.now },
    vibrationLevel: { type: Number },
    temperatureCelsius: { type: Number },
    operatingHours: { type: Number }
  }],
  aiPredictiveModel: {
    anomalyDetected: { type: Boolean, default: false },
    failureRiskScore: { type: Number, default: 0 },
    recommendedAction: { type: String },
    nextPredictedFailureDate: { type: Date }
  }
}, { timestamps: true });

AssetSchema.index({ societyId: 1, status: 1 });

export const Asset = model<IAsset>('Asset', AssetSchema);
