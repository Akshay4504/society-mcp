"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const appError_1 = require("../utils/appError");
const errorMiddleware = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log unexpected errors
    if (!err.isOperational) {
        console.error('[Unhandled Error]', err.stack || err);
    }
    else {
        console.warn(`[Operational Error] ${err.statusCode} - ${err.message}`);
    }
    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Resource not found with invalid id of ${err.value}`;
        error = new appError_1.AppError(message, 404);
    }
    // Handle Mongoose Duplicate Key Error (MongoDB code 11000)
    if (err.code === 11000) {
        const fields = Object.keys(err.keyValue || {}).join(', ');
        const message = `Duplicate value entered for fields: [${fields}]. Please use another value.`;
        error = new appError_1.AppError(message, 400);
    }
    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join('. ');
        error = new appError_1.AppError(message, 400);
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new appError_1.AppError('Invalid authentication token. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new appError_1.AppError('Authentication token has expired. Please log in again.', 401);
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorMiddleware = errorMiddleware;
