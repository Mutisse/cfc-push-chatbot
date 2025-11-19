import { PrayerRequest, IPrayerRequest } from "../models/PrayerRequest";
import { UserStateService } from "./UserStateService";
import { logger } from "../config/logger";

export class PrayerService {
  /**
   * Criar um novo pedido de oração
   */
  static async createPrayerRequest(data: {
    userPhone: string;
    userName: string;
    description: string;
    type: IPrayerRequest["type"];
    familyMemberName?: string;
    isAnonymous?: boolean;
  }): Promise<IPrayerRequest> {
    try {
      const prayerRequest = await PrayerRequest.create({
        userPhone: data.userPhone,
        userName: data.isAnonymous ? "Anónimo" : data.userName,
        description: data.description,
        type: data.type,
        familyMemberName: data.familyMemberName,
        isAnonymous: data.isAnonymous || false,
        status: "pendente",
        prayerCount: 0,
      });

      logger.info(
        `✅ Pedido de oração criado: ${data.userName} - ${data.type}`
      );
      return prayerRequest;
    } catch (error) {
      logger.error("❌ Erro ao criar pedido de oração:", error);
      throw new Error("Falha ao criar pedido de oração");
    }
  }

  /**
   * Processar pedido de oração do usuário
   */
  static async processUserPrayerRequest(
    phone: string,
    message: string
  ): Promise<{
    success: boolean;
    message: string;
    requestId?: string;
  }> {
    try {
      const session = await UserStateService.getState(phone);
      const userData = session?.data || {};

      if (!userData.prayerType) {
        return {
          success: false,
          message: "Tipo de oração não definido. Por favor, comece novamente.",
        };
      }

      // ✅ CORREÇÃO: Verificar anonimato corretamente
      let userName = "Anónimo";
      let isAnonymous = true;

      // Se o usuário escolheu NÃO ser anônimo (opção "2")
      if (userData.prayerAnonymity === "2") {
        try {
          const user = await UserStateService.getUser(phone);
          userName = user?.name || "Irmão/Irmã";
          isAnonymous = false;
        } catch (error) {
          logger.error("❌ Erro ao buscar usuário:", error);
        }
      }

      // Criar pedido de oração
      const prayerRequest = await this.createPrayerRequest({
        userPhone: phone,
        userName: userName,
        description: message,
        type: userData.prayerType as IPrayerRequest["type"],
        familyMemberName: userData.prayerFamilyName,
        isAnonymous: isAnonymous,
      });

      // Limpar estado do usuário
      await UserStateService.resetToMainMenu(phone);

      return {
        success: true,
        message: this.generateSuccessMessage(userName, userData),
        requestId: prayerRequest._id.toString(),
      };
    } catch (error) {
      logger.error("❌ Erro ao processar pedido de oração:", error);
      return {
        success: false,
        message: "❌ Erro ao processar seu pedido. Por favor, tente novamente.",
      };
    }
  }

  /**
   * Gerar mensagem de sucesso
   */
  private static generateSuccessMessage(
    userName: string,
    userData: any
  ): string {
    const anonymityText = userName === "Anónimo" ? " (Anónimo)" : "";

    return `✅ *PEDIDO DE ORAÇÃO ENVIADO!*\n\n*Irmão(ã) ${userName}${anonymityText}*, nosso time de intercessão já está orando por você!\n\n*Detalhes do pedido:*\n• Tipo: ${
      userData.prayerType
    }\n${
      userData.prayerFamilyName ? `• Para: ${userData.prayerFamilyName}\n` : ""
    }• Seu pedido: "${
      userData.prayerDetail
    }"\n\n🙏 *Deus te abençoe e guarde!*\n\nVocê receberá atualizações sobre seu pedido.\n\nDigite [#] para menu principal.`;
  }

  // ... (os outros métodos permanecem iguais)

  /**
   * Buscar pedidos de oração por usuário
   */
  static async getPrayerRequestsByUser(
    userPhone: string
  ): Promise<IPrayerRequest[]> {
    try {
      return await PrayerRequest.find({ userPhone })
        .sort({ createdAt: -1 })
        .limit(10);
    } catch (error) {
      logger.error("❌ Erro ao buscar pedidos de oração:", error);
      throw new Error("Falha ao buscar pedidos de oração");
    }
  }

  /**
   * Buscar todos os pedidos com filtros
   */
  static async getAllPrayerRequests(
    filters: {
      status?: IPrayerRequest["status"];
      type?: IPrayerRequest["type"];
      isAnonymous?: boolean;
      limit?: number;
    } = {}
  ): Promise<IPrayerRequest[]> {
    try {
      const query: any = {};

      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.isAnonymous !== undefined)
        query.isAnonymous = filters.isAnonymous;

      return await PrayerRequest.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);
    } catch (error) {
      logger.error("❌ Erro ao buscar pedidos de oração:", error);
      throw new Error("Falha ao buscar pedidos de oração");
    }
  }

  /**
   * Atualizar status de um pedido de oração
   */
  static async updatePrayerStatus(
    requestId: string,
    status: IPrayerRequest["status"]
  ): Promise<IPrayerRequest | null> {
    try {
      const updatedRequest = await PrayerRequest.findByIdAndUpdate(
        requestId,
        {
          status,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updatedRequest) {
        logger.info(
          `✅ Status do pedido de oração atualizado: ${requestId} -> ${status}`
        );
      }

      return updatedRequest;
    } catch (error) {
      logger.error("❌ Erro ao atualizar status do pedido de oração:", error);
      throw new Error("Falha ao atualizar status");
    }
  }

  /**
   * Incrementar contador de orações
   */
  static async incrementPrayerCount(
    requestId: string
  ): Promise<IPrayerRequest | null> {
    try {
      const updatedRequest = await PrayerRequest.findByIdAndUpdate(
        requestId,
        {
          $inc: { prayerCount: 1 },
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updatedRequest) {
        logger.info(`✅ Contador de orações incrementado: ${requestId}`);
      }

      return updatedRequest;
    } catch (error) {
      logger.error("❌ Erro ao incrementar contador de orações:", error);
      throw new Error("Falha ao incrementar contador");
    }
  }

  /**
   * Obter estatísticas de oração
   */
  static async getPrayerStatistics(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    byType: { [key: string]: number };
    totalPrayers: number;
    anonymousCount: number;
  }> {
    try {
      const total = await PrayerRequest.countDocuments();

      const byStatus = await PrayerRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const byType = await PrayerRequest.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]);

      const totalPrayersResult = await PrayerRequest.aggregate([
        { $group: { _id: null, total: { $sum: "$prayerCount" } } },
      ]);

      const anonymousCount = await PrayerRequest.countDocuments({
        isAnonymous: true,
      });

      return {
        total,
        byStatus: this.arrayToObject(byStatus),
        byType: this.arrayToObject(byType),
        totalPrayers: totalPrayersResult[0]?.total || 0,
        anonymousCount,
      };
    } catch (error) {
      logger.error("❌ Erro ao buscar estatísticas de oração:", error);
      throw new Error("Falha ao buscar estatísticas");
    }
  }

  /**
   * Converter array de agregação para objeto
   */
  private static arrayToObject(array: any[]): { [key: string]: number } {
    return array.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  }

  /**
   * Buscar pedidos recentes para dashboard
   */
  static async getRecentPrayerRequests(
    limit: number = 5
  ): Promise<IPrayerRequest[]> {
    try {
      return await PrayerRequest.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("userName type description status createdAt");
    } catch (error) {
      logger.error("❌ Erro ao buscar pedidos recentes:", error);
      throw new Error("Falha ao buscar pedidos recentes");
    }
  }

  /**
   * Buscar pedidos que precisam de oração
   */
  static async getPrayerRequestsNeedingPrayer(): Promise<IPrayerRequest[]> {
    try {
      return await PrayerRequest.find({
        status: { $in: ["pendente", "em_oracao"] },
      })
        .sort({ createdAt: 1 })
        .limit(10)
        .select("userName type description prayerCount createdAt");
    } catch (error) {
      logger.error("❌ Erro ao buscar pedidos necessitando oração:", error);
      throw new Error("Falha ao buscar pedidos");
    }
  }
}
