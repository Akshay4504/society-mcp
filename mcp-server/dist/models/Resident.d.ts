import { Schema, Document } from 'mongoose';
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
export declare const Resident: import("mongoose").Model<IResident, {}, {}, {}, Document<unknown, {}, IResident, {}, {}> & IResident & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
