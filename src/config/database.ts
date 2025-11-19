import mongoose from "mongoose";
import { logger } from "./logger";

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("📊 MongoDB já está conectado");
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error("MONGODB_URI não está definida nas variáveis de ambiente");
      }

      // Log seguro da string de conexão
      const safeUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      logger.info(`🔌 Conectando ao MongoDB: ${safeUri}`);

      // Configurações simples
      mongoose.set("strictQuery", true);

      // Opções de conexão
      const options = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      };

      await mongoose.connect(mongoUri, options);

      this.isConnected = true;
      logger.info("✅ MongoDB conectado com sucesso!");

      // Event listeners
      mongoose.connection.on("error", (error) => {
        logger.error("❌ Erro na conexão MongoDB:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("⚠️ MongoDB desconectado");
        this.isConnected = false;
      });

    } catch (error: any) {
      logger.error("❌ Erro ao conectar com MongoDB:", error.message);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("✅ MongoDB desconectado com sucesso!");
    } catch (error) {
      logger.error("❌ Erro ao desconectar MongoDB:", error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // ✅ ADICIONAR MÉTODO healthCheck QUE ESTÁ FALTANDO
  public async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnected || mongoose.connection.readyState !== 1) {
        return {
          status: "desconectado",
          details: {
            conectado: false,
            estado: mongoose.connection.readyState,
          },
        };
      }

      return {
        status: "conectado",
        details: {
          conectado: true,
          estado: mongoose.connection.readyState,
          servidor: mongoose.connection.host,
          nome: mongoose.connection.name,
        },
      };
    } catch (error: any) {
      return {
        status: "erro",
        details: {
          conectado: false,
          estado: mongoose.connection.readyState,
          erro: error.message,
        },
      };
    }
  }

  private async gracefulShutdown(): Promise<void> {
    logger.info("🛑 A iniciar encerramento gracioso...");

    try {
      await this.disconnect();
      logger.info("✅ Encerramento concluído com sucesso");
      process.exit(0);
    } catch (error) {
      logger.error("❌ Erro durante o encerramento:", error);
      process.exit(1);
    }
  }
}

export const database = Database.getInstance();