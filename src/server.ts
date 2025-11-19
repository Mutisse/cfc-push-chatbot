// ⭐⭐ CARREGAR VARIÁVEIS DE AMBIENTE PRIMEIRO! ⭐⭐
import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { database } from "./config/database";
import { logger } from "./config/logger";

class Server {
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || "10000");
    this.setupProcessHandlers();
  }

  private setupProcessHandlers(): void {
    process.on("SIGINT", async () => {
      logger.info("📞 Recebido SIGINT (Ctrl+C)");
      await this.gracefulShutdown();
    });

    process.on("SIGTERM", async () => {
      logger.info("📞 Recebido SIGTERM");
      await this.gracefulShutdown();
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("❌ Rejeição não tratada:", reason);
    });

    process.on("uncaughtException", (error) => {
      logger.error("❌ Exceção não capturada:", error);
      process.exit(1);
    });
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info("🛑 Iniciando encerramento gracioso...");

    try {
      await database.disconnect();
      logger.info("✅ Encerramento concluído com sucesso");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Erro durante o encerramento:", error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Verificar variáveis críticas
      const requiredEnvVars = [
        "MONGODB_URI",
        "TWILIO_ACCOUNT_SID",
        "TWILIO_AUTH_TOKEN",
      ];
      const missingVars = requiredEnvVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingVars.length > 0) {
        throw new Error(
          `Variáveis de ambiente ausentes: ${missingVars.join(", ")}`
        );
      }

      console.log(
        "🔍 SERVER - MONGODB_URI:",
        process.env.MONGODB_URI ? "✅ CARREGADA" : "❌ UNDEFINED"
      );

      // Conectar ao MongoDB
      await database.connect();

      // Iniciar servidor
      app.listen(this.port, () => {
        logger.info(
          `🚀 Servidor CFC PUSH Chatbot iniciado na porta ${this.port}`
        );
        logger.info(`📊 Ambiente: ${process.env.NODE_ENV || "development"}`);
        logger.info(`🌐 URL: http://localhost:${this.port}`);
        logger.info(`❤️  Health check: http://localhost:${this.port}/health`);
        logger.info(
          `🤖 Webhook: http://localhost:${this.port}/api/chatbot/webhook`
        );
      });
    } catch (error: any) {
      logger.error("❌ Falha ao iniciar aplicação:", error.message);
      process.exit(1);
    }
  }
}

// ⭐⭐ PONTO DE ENTRADA PRINCIPAL ⭐⭐
const server = new Server();

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  server.start().catch((error) => {
    console.error("❌ Erro fatal ao iniciar servidor:", error);
    process.exit(1);
  });
}

export { Server };
