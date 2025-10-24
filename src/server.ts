import { app } from "./app";
import { config } from "./config/env";
import { database } from "./config/database";
import { logger } from "./config/logger";

export class Server {
  private server: any;
  private isShuttingDown: boolean = false;

  constructor() {
    this.setupProcessHandlers();
  }

  private setupProcessHandlers(): void {
    // Handlers para graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("📞 Recebido SIGINT (Ctrl+C)");
      await this.shutdown();
    });

    process.on("SIGTERM", async () => {
      logger.info("📞 Recebido SIGTERM");
      await this.shutdown();
    });

    // Handler para erros não capturados
    process.on("uncaughtException", (error) => {
      logger.error("💥 Erro não capturado:", error);
      this.emergencyShutdown();
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("💥 Promise rejeitada não tratada:", reason);
      this.emergencyShutdown();
    });
  }

  public async start(): Promise<void> {
    try {
      if (this.isShuttingDown) {
        logger.info("⏸️  Servidor está em processo de shutdown");
        return;
      }

      // Conectar ao banco primeiro
      logger.info("🚀 Iniciando CFC PUSH Chatbot...");
      await database.connect();

      // Iniciar servidor HTTP
      const port = config.port;
      this.server = app.getApp().listen(port, () => {
        logger.info(`🎉 Servidor rodando na porta ${port}`);
        logger.info(`📍 Health check: http://localhost:${port}/health`);
        logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
      });

      // Configurar handlers do servidor
      this.setupServerHandlers();

    } catch (error) {
      logger.error("❌ Falha ao iniciar aplicação:", error);
      process.exit(1);
    }
  }

  private setupServerHandlers(): void {
    this.server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Porta ${config.port} já está em uso`);
        process.exit(1);
      } else {
        logger.error('❌ Erro no servidor:', error);
        process.exit(1);
      }
    });

    this.server.on('listening', () => {
      logger.info('✅ Servidor ouvindo conexões');
    });
  }

  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      logger.info("⏸️  Shutdown já em andamento");
      return;
    }

    this.isShuttingDown = true;
    logger.info("🛑 Iniciando shutdown gracioso da aplicação...");

    try {
      // Fechar servidor HTTP
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            logger.info("✅ Servidor HTTP fechado");
            resolve();
          });
        });
      }

      // Desconectar banco
      await database.disconnect();

      logger.info("✅ Aplicação finalizada com sucesso");
      process.exit(0);

    } catch (error) {
      logger.error("❌ Erro durante shutdown:", error);
      process.exit(1);
    }
  }

  private emergencyShutdown(): void {
    logger.error("🚨 Emergency shutdown iniciado");
    
    // Fechar imediatamente
    if (this.server) {
      this.server.close();
    }
    
    process.exit(1);
  }

  public getServer(): any {
    return this.server;
  }

  public getShutdownStatus(): boolean {
    return this.isShuttingDown;
  }
}

// Criar e exportar instância do Server
export const server = new Server();

// ⭐⭐ PONTO DE ENTRADA PRINCIPAL - DIRETO AQUI! ⭐⭐
// Iniciar aplicação se este arquivo for executado diretamente
if (require.main === module) {
  server.start().catch((error) => {
    console.error("❌ Falha ao iniciar aplicação:", error);
    process.exit(1);
  });
}

export default server;