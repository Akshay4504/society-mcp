import { Schema, Document } from 'mongoose';
export interface INotice extends Document {
    societyId: Schema.Types.ObjectId;
    authorId: Schema.Types.ObjectId;
    title: string;
    content: string;
    category: string;
    isPinned: boolean;
    targetAudience: string;
}
export declare const Notice: import("mongoose").Model<INotice, {}, {}, {}, Document<unknown, {}, INotice, {}, {}> & INotice & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
