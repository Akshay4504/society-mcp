"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = require("mongoose");
const RefreshTokenSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID reference is required']
    },
    token: {
        type: String,
        required: [true, 'Token string is required'],
        unique: true
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required'],
        index: { expires: 0 } // TTL index: document will expire and be deleted automatically at 'expiresAt'
    }
}, { timestamps: true });
exports.RefreshToken = (0, mongoose_1.model)('RefreshToken', RefreshTokenSchema);
