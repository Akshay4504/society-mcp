"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const mongoose_1 = require("mongoose");
const AssetSchema = new mongoose_1.Schema({
    societyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Society', required: true },
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
exports.Asset = (0, mongoose_1.model)('Asset', AssetSchema);
