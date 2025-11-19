"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("./logger");
class Database {
    constructor() {
        this.isConnected = false;
    }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.logger.info("📊 MongoDB já está conectado");
            return;
        }
        try {
            const mongoUri = process.env.MONGODB_URI || "mongodb+srv://edilsonmutissedev_db_user:WKFJJhNed8S34UHm@cluster0.hdutyoi.mongodb.net/cfc_push_chatbot?retryWrites=true&w=majority";
            // Configurações do Mongoose
            mongoose_1.default.set("strictQuery", true);
            logger_1.logger.info("🔌 A conectar ao MongoDB...");
            // CONEXÃO ÚNICA - remova a duplicação
            await mongoose_1.default.connect(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            this.isConnected = true;
            logger_1.logger.info("✅ MongoDB conectado com sucesso!");
            // Event listeners para monitoramento
            mongoose_1.default.connection.on("error", (error) => {
                logger_1.logger.error("❌ Erro na conexão MongoDB:", error);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("disconnected", () => {
                logger_1.logger.warn("⚠️ MongoDB desconectado");
                this.isConnected = false;
            });
            mongoose_1.default.connection.on("reconnected", () => {
                logger_1.logger.info("🔁 MongoDB reconectado");
                this.isConnected = true;
            });
            // Graceful shutdown
            process.on("SIGINT", this.gracefulShutdown.bind(this));
            process.on("SIGTERM", this.gracefulShutdown.bind(this));
        }
        catch (error) {
            logger_1.logger.error("❌ Erro ao conectar com MongoDB:", error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            logger_1.logger.info("📊 MongoDB já está desconectado");
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.logger.info("✅ MongoDB desconectado com sucesso!");
        }
        catch (error) {
            logger_1.logger.error("❌ Erro ao desconectar MongoDB:", error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    async healthCheck() {
        try {
            if (!this.isConnected || mongoose_1.default.connection.readyState !== 1) {
                return {
                    status: "desconectado",
                    details: {
                        conectado: false,
                        estado: mongoose_1.default.connection.readyState,
                    },
                };
            }
            // VERIFICAÇÃO SEGURA - só tenta ping se db existir
            if (!mongoose_1.default.connection.db) {
                return {
                    status: "conectando",
                    details: {
                        conectado: false,
                        estado: mongoose_1.default.connection.readyState,
                        mensagem: "Instância da base de dados ainda não disponível",
                    },
                };
            }
            const adminDb = mongoose_1.default.connection.db.admin();
            const result = await adminDb.ping();
            return {
                status: "conectado",
                details: {
                    conectado: true,
                    ping: result,
                    estado: mongoose_1.default.connection.readyState,
                    servidor: mongoose_1.default.connection.host,
                    porta: mongoose_1.default.connection.port,
                    nome: mongoose_1.default.connection.name,
                    base_dados: mongoose_1.default.connection.db.databaseName,
                },
            };
        }
        catch (error) {
            return {
                status: "erro",
                details: {
                    conectado: false,
                    estado: mongoose_1.default.connection.readyState,
                    erro: error.message,
                },
            };
        }
    }
    async gracefulShutdown() {
        logger_1.logger.info("🛑 A iniciar encerramento gracioso...");
        try {
            await this.disconnect();
            logger_1.logger.info("✅ Encerramento concluído com sucesso");
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error("❌ Erro durante o encerramento:", error);
            process.exit(1);
        }
    }
}
exports.database = Database.getInstance();
