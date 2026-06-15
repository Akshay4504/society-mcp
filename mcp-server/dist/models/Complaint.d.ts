import { Schema, Document } from 'mongoose';
export interface IComplaint extends Document {
    societyId: Schema.Types.ObjectId;
    raisedBy: Schema.Types.ObjectId;
    title: string;
    description: string;
    images: string[];
    status: string;
    assignedTo?: Schema.Types.ObjectId;
    aiAnalysis: {
        detectedCategory: string;
        confidenceScore: number;
        estimatedPriority: string;
        sentimentScore: number;
        explanation: string;
    };
}
export declare const Complaint: import("mongoose").Model<IComplaint, {}, {}, {}, Document<unknown, {}, IComplaint, {}, {}> & IComplaint & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
