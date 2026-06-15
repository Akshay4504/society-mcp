"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const appError_1 = require("../utils/appError");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('. ');
                return next(new appError_1.AppError(`Validation error: ${errorMessages}`, 400));
            }
            next(error);
        }
    };
};
exports.validate = validate;
