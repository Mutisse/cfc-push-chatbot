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
      const mongoUri =
        process.env.MONGODB_URI || "mongodb+srv://edilsonmutissedev_db_user:WKFJJhNed8S34UHm@cluster0.hdutyoi.mongodb.net/cfc_push_chatbot?retryWrites=true&w=majority";

      // Configurações do Mongoose
      mongoose.set("strictQuery", true);

      logger.info("🔌 A conectar ao MongoDB...");

      // CONEXÃO ÚNICA - remova a duplicação
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      } as mongoose.ConnectOptions);

      this.isConnected = true;
      logger.info("✅ MongoDB conectado com sucesso!");

      // Event listeners para monitoramento
      mongoose.connection.on("error", (error) => {
        logger.error("❌ Erro na conexão MongoDB:", error);
        this.isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        logger.warn("⚠️ MongoDB desconectado");
        this.isConnected = false;
      });

      mongoose.connection.on("reconnected", () => {
        logger.info("🔁 MongoDB reconectado");
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on("SIGINT", this.gracefulShutdown.bind(this));
      process.on("SIGTERM", this.gracefulShutdown.bind(this));
    } catch (error) {
      logger.error("❌ Erro ao conectar com MongoDB:", error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info("📊 MongoDB já está desconectado");
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

      // VERIFICAÇÃO SEGURA - só tenta ping se db existir
      if (!mongoose.connection.db) {
        return {
          status: "conectando",
          details: {
            conectado: false,
            estado: mongoose.connection.readyState,
            mensagem: "Instância da base de dados ainda não disponível",
          },
        };
      }

      const adminDb = mongoose.connection.db.admin();
      const result = await adminDb.ping();

      return {
        status: "conectado",
        details: {
          conectado: true,
          ping: result,
          estado: mongoose.connection.readyState,
          servidor: mongoose.connection.host,
          porta: mongoose.connection.port,
          nome: mongoose.connection.name,
          base_dados: mongoose.connection.db.databaseName,
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
