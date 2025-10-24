"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const logger_1 = require("./config/logger");
// Carregar variáveis de ambiente
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddlewares() {
        // CORS
        this.app.use((0, cors_1.default)({
            origin: process.env.ALLOWED_ORIGINS?.split(",") || [
                "http://localhost:3000",
            ],
            credentials: true,
        }));
        // Body parsers
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        // Morgan para logging de HTTP
        this.app.use((0, morgan_1.default)("combined", { stream: logger_1.morganStream }));
        // Request logging middleware customizado
        this.app.use((req, res, next) => {
            logger_1.logger.http(`📨 ${req.method} ${req.path} - IP: ${req.ip}`);
            next();
        });
    }
    setupRoutes() {
        // Health check em Português
        this.app.get("/health", async (req, res) => {
            try {
                // Importação dinâmica para evitar circular dependency
                const { database } = await Promise.resolve().then(() => __importStar(require("./config/database")));
                const dbHealth = await database.healthCheck();
                const healthInfo = {
                    status: "OK",
                    mensagem: "CFC PUSH Chatbot está em execução!",
                    timestamp: new Date().toISOString(),
                    tempo_activacao: process.uptime(),
                    memoria: process.memoryUsage(),
                    base_dados: dbHealth,
                    ambiente: process.env.NODE_ENV || "desenvolvimento",
                };
                // Se o banco não estiver saudável, retornar status 503
                const statusCode = dbHealth.status === "conectado" ? 200 : 503;
                res.status(statusCode).json(healthInfo);
            }
            catch (error) {
                logger_1.logger.error("❌ Erro no health check:", error);
                res.status(503).json({
                    status: "ERRO",
                    mensagem: "Problemas no servidor",
                    timestamp: new Date().toISOString(),
                });
            }
        });
        // Routes da aplicação
        this.app.use("/api", chatRoutes_1.default);
        //this.app.use("/api/dashboard", dashboardRoutes); // Adicione esta linha
        // 404 handler
        this.app.use("*", (req, res) => {
            logger_1.logger.warn(`🔍 Rota não encontrada: ${req.method} ${req.originalUrl}`);
            res.status(404).json({
                status: "ERRO",
                mensagem: "Rota não encontrada",
                path: req.originalUrl,
            });
        });
    }
    setupErrorHandling() {
        // Error handler global
        this.app.use((error, req, res, next) => {
            logger_1.logger.error("💥 Erro não tratado:", {
                message: error.message,
                stack: error.stack,
                url: req.url,
                method: req.method,
                ip: req.ip,
            });
            res.status(error.status || 500).json({
                status: "ERRO",
                mensagem: process.env.NODE_ENV === "production"
                    ? "Erro interno do servidor"
                    : error.message,
                ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
            });
        });
    }
    getApp() {
        return this.app;
    }
}
exports.App = App;
// Exportar instância do App
exports.app = new App();
exports.default = exports.app;
