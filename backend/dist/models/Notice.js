"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notice = void 0;
const mongoose_1 = require("mongoose");
const NoticeSchema = new mongoose_1.Schema({
    societyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Society',
        required: [true, 'Society reference is required']
    },
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author (User) reference is required']
    },
    title: {
        type: String,
        required: [true, 'Notice title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Notice content is required'],
        trim: true
    },
    category: {
        type: String,
        enum: {
            values: ['General', 'Financial', 'Emergency', 'Event'],
            message: '{VALUE} is not a valid notice category'
        },
        default: 'General'
    },
    attachments: [{
            type: String,
            trim: true,
            match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, 'Please enter valid attachment URLs']
        }],
    translations: [{
            languageCode: { type: String, required: [true, 'Language code is required'], trim: true },
            title: { type: String, required: [true, 'Translated title is required'], trim: true },
            content: { type: String, required: [true, 'Translated content is required'], trim: true }
        }],
    isPinned: {
        type: Boolean,
        default: false
    },
    targetAudience: {
        type: String,
        enum: {
            values: ['All', 'Owners', 'Tenants', 'Staff'],
            message: '{VALUE} is not a valid target audience'
        },
        default: 'All'
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Indexes for query optimization
NoticeSchema.index({ societyId: 1, isPinned: -1, createdAt: -1 });
NoticeSchema.index({ expiresAt: 1 });
exports.Notice = (0, mongoose_1.model)('Notice', NoticeSchema);
