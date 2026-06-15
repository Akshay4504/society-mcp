import { Schema, Document } from 'mongoose';
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    societyId: Schema.Types.ObjectId | null;
    flatDetails?: {
        block: string;
        flatNumber: string;
        areaSqFt: number;
        occupancyStatus: string;
    };
    isActive: boolean;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
