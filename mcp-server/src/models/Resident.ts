import { Schema, model, Document } from 'mongoose';

export interface IVehicle {
  vehicleNumber: string;
  vehicleType: string;
  parkingSlotNumber: string;
}

export interface IFamilyMember {
  name: string;
  relation: string;
  contactNumber?: string;
}

export interface IEmergencyContact {
  name: string;
  relation: string;
  contactNumber: string;
}

export interface IResident extends Document {
  userId: Schema.Types.ObjectId;
  societyId: Schema.Types.ObjectId;
  block: string;
  flatNumber: string;
  status: string;
  occupancyType: string;
  moveInDate: Date;
  vehicles: IVehicle[];
  familyMembers: IFamilyMember[];
  emergencyContact: IEmergencyContact;
}

const VehicleSchema = new Schema<IVehicle>({
  vehicleNumber: { type: String, required: true },
  vehicleType: { type: String, required: true },
  parkingSlotNumber: { type: String, required: true }
}, { _id: false });

const FamilyMemberSchema = new Schema<IFamilyMember>({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  contactNumber: { type: String }
}, { _id: false });

const ResidentSchema = new Schema<IResident>({
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

export const Resident = model<IResident>('Resident', ResidentSchema);
