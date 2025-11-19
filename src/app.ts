import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import chatRoutes from "./routes/chatRoutes";
import { logger, morganStream } from "./config/logger";


// Carregar variáveis de ambiente
dotenv.config();

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    // CORS
    this.app.use(
      cors({
        origin: process.env.ALLOWED_ORIGINS?.split(",") || [
          "http://localhost:9000",
        ],
        credentials: true,
      })
    );

    // Body parsers
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Morgan para logging de HTTP
    this.app.use(morgan("combined", { stream: morganStream }));

    // Request logging middleware customizado
    this.app.use((req, res, next) => {
      logger.http(`📨 ${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check em Português
    this.app.get("/health", async (req, res) => {
      try {
        // Importação dinâmica para evitar circular dependency
        const { database } = await import("./config/database");
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
      } catch (error) {
        logger.error("❌ Erro no health check:", error);
        res.status(503).json({
          status: "ERRO",
          mensagem: "Problemas no servidor",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Routes da aplicação
    this.app.use("/api", chatRoutes);
    //this.app.use("/api/dashboard", dashboardRoutes); // Adicione esta linha

    // 404 handler
    this.app.use("*", (req, res) => {
      logger.warn(`🔍 Rota não encontrada: ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        status: "ERRO",
        mensagem: "Rota não encontrada",
        path: req.originalUrl,
      });
    });
  }

  private setupErrorHandling(): void {
    // Error handler global
    this.app.use(
      (
        error: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error("💥 Erro não tratado:", {
          message: error.message,
          stack: error.stack,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        res.status(error.status || 500).json({
          status: "ERRO",
          mensagem:
            process.env.NODE_ENV === "production"
              ? "Erro interno do servidor"
              : error.message,
          ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
        });
      }
    );
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Exportar instância do App
export const app = new App();
export default app;
