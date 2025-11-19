"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.Server = void 0;
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const logger_1 = require("./config/logger");
class Server {
    constructor() {
        this.isShuttingDown = false;
        this.setupProcessHandlers();
    }
    setupProcessHandlers() {
        // Handlers para graceful shutdown
        process.on("SIGINT", async () => {
            logger_1.logger.info("📞 Recebido SIGINT (Ctrl+C)");
            await this.shutdown();
        });
        process.on("SIGTERM", async () => {
            logger_1.logger.info("📞 Recebido SIGTERM");
            await this.shutdown();
        });
        // Handler para erros não capturados
        process.on("uncaughtException", (error) => {
            logger_1.logger.error("💥 Erro não capturado:", error);
            this.emergencyShutdown();
        });
        process.on("unhandledRejection", (reason, promise) => {
            logger_1.logger.error("💥 Promise rejeitada não tratada:", reason);
            this.emergencyShutdown();
        });
    }
    async start() {
        try {
            if (this.isShuttingDown) {
                logger_1.logger.info("⏸️  Servidor está em processo de shutdown");
                return;
            }
            // Conectar ao banco primeiro
            logger_1.logger.info("🚀 Iniciando CFC PUSH Chatbot...");
            await database_1.database.connect();
            // Iniciar servidor HTTP
            const port = env_1.config.port;
            this.server = app_1.app.getApp().listen(port, () => {
                logger_1.logger.info(`🎉 Servidor rodando na porta ${port}`);
                logger_1.logger.info(`📍 Health check: http://localhost:${port}/health`);
                logger_1.logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
            });
            // Configurar handlers do servidor
            this.setupServerHandlers();
        }
        catch (error) {
            logger_1.logger.error("❌ Falha ao iniciar aplicação:", error);
            process.exit(1);
        }
    }
    setupServerHandlers() {
        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger_1.logger.error(`❌ Porta ${env_1.config.port} já está em uso`);
                process.exit(1);
            }
            else {
                logger_1.logger.error('❌ Erro no servidor:', error);
                process.exit(1);
            }
        });
        this.server.on('listening', () => {
            logger_1.logger.info('✅ Servidor ouvindo conexões');
        });
    }
    async shutdown() {
        if (this.isShuttingDown) {
            logger_1.logger.info("⏸️  Shutdown já em andamento");
            return;
        }
        this.isShuttingDown = true;
        logger_1.logger.info("🛑 Iniciando shutdown gracioso da aplicação...");
        try {
            // Fechar servidor HTTP
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.close(() => {
                        logger_1.logger.info("✅ Servidor HTTP fechado");
                        resolve();
                    });
                });
            }
            // Desconectar banco
            await database_1.database.disconnect();
            logger_1.logger.info("✅ Aplicação finalizada com sucesso");
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error("❌ Erro durante shutdown:", error);
            process.exit(1);
        }
    }
    emergencyShutdown() {
        logger_1.logger.error("🚨 Emergency shutdown iniciado");
        // Fechar imediatamente
        if (this.server) {
            this.server.close();
        }
        process.exit(1);
    }
    getServer() {
        return this.server;
    }
    getShutdownStatus() {
        return this.isShuttingDown;
    }
}
exports.Server = Server;
// Criar e exportar instância do Server
exports.server = new Server();
// ⭐⭐ PONTO DE ENTRADA PRINCIPAL - DIRETO AQUI! ⭐⭐
// Iniciar aplicação se este arquivo for executado diretamente
if (require.main === module) {
    exports.server.start().catch((error) => {
        console.error("❌ Falha ao iniciar aplicação:", error);
        process.exit(1);
    });
}
exports.default = exports.server;
