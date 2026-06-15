"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl } = req;
        const { statusCode } = res;
        let logType = console.log;
        if (statusCode >= 500) {
            logType = console.error;
        }
        else if (statusCode >= 400) {
            logType = console.warn;
        }
        logType(`[HTTP] ${method} ${originalUrl} ${statusCode} - ${duration}ms`);
    });
    next();
};
exports.loggerMiddleware = loggerMiddleware;
