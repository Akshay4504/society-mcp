import { Schema, Document } from 'mongoose';
export interface IMaintenancePayment extends Document {
    societyId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    billId: Schema.Types.ObjectId;
    amountPaid: number;
    paymentMethod: string;
    status: string;
    transactionId: string;
    paymentDate: Date;
}
export declare const MaintenancePayment: import("mongoose").Model<IMaintenancePayment, {}, {}, {}, Document<unknown, {}, IMaintenancePayment, {}, {}> & IMaintenancePayment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
