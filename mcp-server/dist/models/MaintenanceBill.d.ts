import { Schema, Document } from 'mongoose';
export interface IMaintenanceBill extends Document {
    societyId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    billingPeriod: string;
    baseAmount: number;
    utilityCharges: number;
    penaltyAmount: number;
    totalAmount: number;
    dueDate: Date;
    status: string;
}
export declare const MaintenanceBill: import("mongoose").Model<IMaintenanceBill, {}, {}, {}, Document<unknown, {}, IMaintenanceBill, {}, {}> & IMaintenanceBill & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
