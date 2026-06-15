"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resident = void 0;
const mongoose_1 = require("mongoose");
const VehicleSchema = new mongoose_1.Schema({
    vehicleNumber: {
        type: String,
        required: [true, 'Vehicle number is required'],
        trim: true,
        uppercase: true,
        match: [/^[A-Z0-9\s-]{4,15}$/, 'Please enter a valid vehicle number']
    },
    vehicleType: {
        type: String,
        enum: {
            values: ['2-wheeler', '4-wheeler'],
            message: '{VALUE} is not a valid vehicle type'
        },
        required: [true, 'Vehicle type is required']
    },
    parkingSlotNumber: {
        type: String,
        required: [true, 'Parking slot number is required'],
        trim: true,
        uppercase: true
    }
}, { _id: false });
const FamilyMemberSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Family member name is required'],
        trim: true
    },
    relation: {
        type: String,
        required: [true, 'Relation is required'],
        trim: true
    },
    contactNumber: {
        type: String,
        trim: true,
        match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid contact number']
    }
}, { _id: false });
const ResidentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID reference is required'],
        unique: true
    },
    societyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Society',
        required: [true, 'Society ID reference is required']
    },
    block: {
        type: String,
        required: [true, 'Block identifier is required'],
        trim: true,
        uppercase: true
    },
    flatNumber: {
        type: String,
        required: [true, 'Flat number is required'],
        trim: true,
        uppercase: true
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Inactive', 'Suspended'],
            message: '{VALUE} is not a valid status'
        },
        default: 'Active'
    },
    occupancyType: {
        type: String,
        enum: {
            values: ['Owner', 'Tenant'],
            message: '{VALUE} is not a valid occupancy type'
        },
        required: [true, 'Occupancy type is required']
    },
    moveInDate: {
        type: Date,
        required: [true, 'Move-in date is required'],
        default: Date.now
    },
    moveOutDate: {
        type: Date
    },
    vehicles: [VehicleSchema],
    familyMembers: [FamilyMemberSchema],
    emergencyContact: {
        name: {
            type: String,
            required: [true, 'Emergency contact name is required'],
            trim: true
        },
        relation: {
            type: String,
            required: [true, 'Emergency contact relation is required'],
            trim: true
        },
        contactNumber: {
            type: String,
            required: [true, 'Emergency contact phone number is required'],
            trim: true,
            match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid emergency contact number']
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for query optimization
ResidentSchema.index({ societyId: 1 });
ResidentSchema.index({ societyId: 1, block: 1, flatNumber: 1 });
ResidentSchema.index({ 'vehicles.vehicleNumber': 1 }, { sparse: true });
exports.Resident = (0, mongoose_1.model)('Resident', ResidentSchema);
