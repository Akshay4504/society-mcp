import { Schema, model } from 'mongoose';
const VehicleSchema = new Schema({
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, required: true },
    parkingSlotNumber: { type: String, required: true }
}, { _id: false });
const FamilyMemberSchema = new Schema({
    name: { type: String, required: true },
    relation: { type: String, required: true },
    contactNumber: { type: String }
}, { _id: false });
const ResidentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    societyId: { type: Schema.Types.ObjectId, ref: 'Society', required: true },
    block: { type: String, required: true },
    flatNumber: { type: String, required: true },
    status: { type: String, default: 'Active' },
    occupancyType: { type: String, required: true },
    moveInDate: { type: Date, default: Date.now },
    vehicles: [VehicleSchema],
    familyMembers: [FamilyMemberSchema],
    emergencyContact: {
        name: { type: String, required: true },
        relation: { type: String, required: true },
        contactNumber: { type: String, required: true }
    }
}, { timestamps: true });
export const Resident = model('Resident', ResidentSchema);
//# sourceMappingURL=Resident.js.map