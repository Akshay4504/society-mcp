"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const routes_1 = __importDefault(require("./routes"));
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
// Load environmental parameters
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware registration
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use(logger_middleware_1.loggerMiddleware);
// Routing tree
app.use('/api/v1', routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
// Centralized error handler middleware
app.use(error_middleware_1.errorMiddleware);
// Boot procedure
const startServer = async () => {
    await (0, database_1.connectDatabase)();
    app.listen(PORT, () => {
        console.log(`[Server] SMM Backend server is running on http://localhost:${PORT}`);
    });
};
startServer();
exports.default = app;
