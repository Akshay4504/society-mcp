import { Document } from 'mongoose';
export interface ISociety extends Document {
    name: string;
    registrationNumber: string;
}
export declare const Society: import("mongoose").Model<ISociety, {}, {}, {}, Document<unknown, {}, ISociety, {}, {}> & ISociety & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
