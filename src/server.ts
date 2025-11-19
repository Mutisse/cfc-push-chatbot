// ⭐⭐ CARREGAR VARIÁVEIS DE AMBIENTE PRIMEIRO! ⭐⭐
import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import { database } from './config/database';
import { logger } from './config/logger';
import { webhookRouter } from './routes/webhookRoutes';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '10000');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.setupProcessHandlers();
  }

  private initializeMiddlewares(): void {
    // CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'https://cfc-push-chatbot.onrender.com'
    ];

    this.app.use(cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing - IMPORTANTE para Twilio (form-urlencoded)
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', async (req, res) => {
      try {
        const dbStatus = database.getConnectionStatus();
        
        const healthInfo = {
          status: dbStatus ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          service: 'CFC Push Chatbot',
          environment: process.env.NODE_ENV || 'development',
          database: { connected: dbStatus },
          uptime: process.uptime()
        };

        res.status(200).json(healthInfo);
      } catch (error) {
        logger.error('Erro no health check:', error);
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Service unavailable'
        });
      }
    });

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        message: '🚀 CFC Push Chatbot API está funcionando!',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      });
    });

    // Webhook routes (MODULARIZADO)
    this.app.use('/api/chatbot', webhookRouter);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Erro não tratado:', error);
      
      res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : error.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
      });
    });
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
      const requiredEnvVars = ['MONGODB_URI', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Variáveis de ambiente ausentes: ${missingVars.join(', ')}`);
      }

      console.log('🔍 SERVER - MONGODB_URI:', process.env.MONGODB_URI ? '✅ CARREGADA' : '❌ UNDEFINED');

      // Conectar ao MongoDB
      await database.connect();

      // Iniciar servidor
      this.app.listen(this.port, () => {
        logger.info(`🚀 Servidor CFC PUSH Chatbot iniciado na porta ${this.port}`);
        logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`🌐 URL: http://localhost:${this.port}`);
        logger.info(`❤️  Health check: http://localhost:${this.port}/health`);
        logger.info(`🤖 Webhook: http://localhost:${this.port}/api/chatbot/webhook`);
      });

    } catch (error: any) {
      logger.error('❌ Falha ao iniciar aplicação:', error.message);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// ⭐⭐ PONTO DE ENTRADA PRINCIPAL ⭐⭐
const server = new Server();

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  server.start().catch(error => {
    console.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  });
}

export { Server, server };