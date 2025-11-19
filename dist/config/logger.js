"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
// Formato personalizado para logs
// No formato de log, você pode ajustar as mensagens:
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
        return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
}));
// Configuração do logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: logFormat,
    transports: [
        // Console transport
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
        }),
        // File transport para errors
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: logFormat,
        }),
        // File transport para todos os logs
        new winston_1.default.transports.File({
            filename: "logs/combined.log",
            format: logFormat,
        }),
    ],
});
// Stream para Morgan usar Winston
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
