import {
  AssistanceRequest,
  IAssistanceRequest,
} from "../models/AssistanceRequest";
import { UserStateService } from "./UserStateService";
import { logger } from "../config/logger";

export class AssistanceService {
  /**
   * Criar uma nova solicitação de assistência
   */
  static async createAssistanceRequest(data: {
    userPhone: string;
    userName: string;
    type: IAssistanceRequest["type"];
    description: string;
    priority?: IAssistanceRequest["priority"];
  }): Promise<IAssistanceRequest> {
    try {
      const assistanceRequest = await AssistanceRequest.create({
        userPhone: data.userPhone,
        userName: data.userName,
        type: data.type,
        description: data.description,
        priority: data.priority || "media",
        status: "pendente",
      });

      logger.info(
        `✅ Solicitação de assistência criada: ${data.userName} - ${data.type}`
      );
      return assistanceRequest;
    } catch (error) {
      logger.error("❌ Erro ao criar solicitação de assistência:", error);
      throw new Error("Falha ao criar solicitação de assistência");
    }
  }

  /**
   * Buscar solicitações de assistência por usuário
   */
  static async getAssistanceRequestsByUser(
    userPhone: string
  ): Promise<IAssistanceRequest[]> {
    try {
      return await AssistanceRequest.find({ userPhone })
        .sort({ createdAt: -1 })
        .limit(10);
    } catch (error) {
      logger.error("❌ Erro ao buscar solicitações de assistência:", error);
      throw new Error("Falha ao buscar solicitações");
    }
  }

  /**
   * Buscar todas as solicitações com filtros
   */
  static async getAllAssistanceRequests(
    filters: {
      status?: IAssistanceRequest["status"];
      type?: IAssistanceRequest["type"];
      priority?: IAssistanceRequest["priority"];
      limit?: number;
    } = {}
  ): Promise<IAssistanceRequest[]> {
    try {
      const query: any = {};

      if (filters.status) query.status = filters.status;
      if (filters.type) query.type = filters.type;
      if (filters.priority) query.priority = filters.priority;

      return await AssistanceRequest.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .limit(filters.limit || 50);
    } catch (error) {
      logger.error("❌ Erro ao buscar solicitações de assistência:", error);
      throw new Error("Falha ao buscar solicitações");
    }
  }

  /**
   * Atualizar status de uma solicitação
   */
  static async updateAssistanceStatus(
    requestId: string,
    status: IAssistanceRequest["status"]
  ): Promise<IAssistanceRequest | null> {
    try {
      const updatedRequest = await AssistanceRequest.findByIdAndUpdate(
        requestId,
        {
          status,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updatedRequest) {
        logger.info(
          `✅ Status da assistência atualizado: ${requestId} -> ${status}`
        );
      }

      return updatedRequest;
    } catch (error) {
      logger.error("❌ Erro ao atualizar status da assistência:", error);
      throw new Error("Falha ao atualizar status");
    }
  }

  /**
   * Atualizar prioridade de uma solicitação
   */
  static async updateAssistancePriority(
    requestId: string,
    priority: IAssistanceRequest["priority"]
  ): Promise<IAssistanceRequest | null> {
    try {
      const updatedRequest = await AssistanceRequest.findByIdAndUpdate(
        requestId,
        {
          priority,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updatedRequest) {
        logger.info(
          `✅ Prioridade da assistência atualizada: ${requestId} -> ${priority}`
        );
      }

      return updatedRequest;
    } catch (error) {
      logger.error("❌ Erro ao atualizar prioridade da assistência:", error);
      throw new Error("Falha ao atualizar prioridade");
    }
  }

  /**
   * Adicionar observação a uma solicitação
   */
  static async addAssistanceObservation(
    requestId: string,
    observation: string
  ): Promise<IAssistanceRequest | null> {
    try {
      const updatedRequest = await AssistanceRequest.findByIdAndUpdate(
        requestId,
        {
          $push: {
            observations: {
              text: observation,
              createdAt: new Date(),
            },
          },
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (updatedRequest) {
        logger.info(`✅ Observação adicionada à assistência: ${requestId}`);
      }

      return updatedRequest;
    } catch (error) {
      logger.error("❌ Erro ao adicionar observação à assistência:", error);
      throw new Error("Falha ao adicionar observação");
    }
  }

  /**
   * Obter estatísticas de assistência
   */
  static async getAssistanceStatistics(): Promise<{
    total: number;
    byStatus: { [key: string]: number };
    byType: { [key: string]: number };
    byPriority: { [key: string]: number };
  }> {
    try {
      const total = await AssistanceRequest.countDocuments();

      const byStatus = await AssistanceRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const byType = await AssistanceRequest.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]);

      const byPriority = await AssistanceRequest.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]);

      return {
        total,
        byStatus: this.arrayToObject(byStatus),
        byType: this.arrayToObject(byType),
        byPriority: this.arrayToObject(byPriority),
      };
    } catch (error) {
      logger.error("❌ Erro ao buscar estatísticas de assistência:", error);
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
   * Processar solicitação de assistência do usuário
   */
  static async processUserAssistanceRequest(
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

      if (!userData.assistanceType) {
        return {
          success: false,
          message:
            "Tipo de assistência não definido. Por favor, comece novamente.",
        };
      }

      // Buscar informações do usuário
      let userName = "Anónimo";
      try {
        const user = await UserStateService.getUser(phone);
        userName = user?.name || "Irmão/Irmã";
      } catch (error) {
        logger.error("❌ Erro ao buscar usuário:", error);
      }

      // Criar solicitação
      const assistanceRequest = await this.createAssistanceRequest({
        userPhone: phone,
        userName: userName,
        type: userData.assistanceType as IAssistanceRequest["type"],
        description: message,
        priority: this.determinePriority(userData.assistanceType),
      });

      // Limpar estado do usuário
      await UserStateService.resetToMainMenu(phone);

      return {
        success: true,
        message: `✅ *SOLICITAÇÃO DE ASSISTÊNCIA ENVIADA!*\n\n*Tipo:* ${userData.assistanceType}\n*Descrição:* ${message}\n\n📞 Nossa equipe social entrará em contato em até 48 horas.\n\n*CFC PUSH - Servindo com Amor!* ❤️`,
        requestId: assistanceRequest._id.toString(),
      };
    } catch (error) {
      logger.error("❌ Erro ao processar solicitação de assistência:", error);
      return {
        success: false,
        message:
          "❌ Erro ao processar sua solicitação. Por favor, tente novamente.",
      };
    }
  }

  /**
   * Determinar prioridade baseada no tipo de assistência
   */
  private static determinePriority(
    assistanceType: string
  ): IAssistanceRequest["priority"] {
    const priorityMap: { [key: string]: IAssistanceRequest["priority"] } = {
      assistencia_medica: "alta",
      assistencia_juridica: "media",
      assistencia_alimentar: "media",
      assistencia_outra: "baixa",
    };

    return priorityMap[assistanceType] || "media";
  }
}
