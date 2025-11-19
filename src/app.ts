import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { webhookRouter } from "./routes/webhookRoutes";
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
          "http://localhost:3000",
          "https://cfc-push-chatbot.onrender.com",
        ],
        credentials: true,
      })
    );

    // Body parsers - IMPORTANTE para Twilio
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
    // Health check
    this.app.get("/health", async (req, res) => {
      try {
        const { database } = await import("./config/database");
        const dbStatus = database.getConnectionStatus();

        const healthInfo = {
          status: dbStatus ? "healthy" : "degraded",
          timestamp: new Date().toISOString(),
          service: "CFC Push Chatbot",
          environment: process.env.NODE_ENV || "development",
          database: { connected: dbStatus },
          uptime: process.uptime(),
        };

        res.status(200).json(healthInfo);
      } catch (error) {
        logger.error("Erro no health check:", error);
        res.status(503).json({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: "Service unavailable",
        });
      }
    });

    // Root route
    this.app.get("/", (req, res) => {
      res.json({
        message: "🚀 CFC Push Chatbot API está funcionando!",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });

    // Webhook routes
    this.app.use("/api/chatbot", webhookRouter);

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
export const app = new App().getApp();
