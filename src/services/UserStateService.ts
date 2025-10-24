import { UserSession, IUserSession, ISessionData } from "../models/UserSession";
import { User, IUser } from "../models/User";
import { PrayerRequest, IPrayerRequest } from "../models/PrayerRequest";

export class UserStateService {
  // GET estado da sessão
  static async getState(phone: string): Promise<IUserSession | null> {
    try {
      return await UserSession.findOne({ phone }).exec();
    } catch (error) {
      console.error("❌ Erro ao buscar estado:", error);
      return null;
    }
  }

  // SET estado da sessão
  static async setState(
    phone: string,
    step: string,
    data: Partial<ISessionData> = {}
  ): Promise<IUserSession> {
    try {
      const existingSession = await this.getState(phone);

      const updateData = {
        step,
        data: { ...existingSession?.data, ...data },
        lastInteraction: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      };

      return await UserSession.findOneAndUpdate({ phone }, updateData, {
        upsert: true,
        new: true,
      }).exec();
    } catch (error) {
      console.error("❌ Erro ao definir estado:", error);
      throw error;
    }
  }

  // UPDATE apenas dados
  static async updateData(
    phone: string,
    newData: Partial<ISessionData>
  ): Promise<IUserSession | null> {
    try {
      const existingSession = await this.getState(phone);
      if (!existingSession) return null;

      return await UserSession.findOneAndUpdate(
        { phone },
        {
          data: { ...existingSession.data, ...newData },
          lastInteraction: new Date(),
        },
        { new: true }
      ).exec();
    } catch (error) {
      console.error("❌ Erro ao atualizar dados:", error);
      return null;
    }
  }

  // DELETE sessão
  static async deleteState(phone: string): Promise<void> {
    try {
      await UserSession.deleteOne({ phone }).exec();
    } catch (error) {
      console.error("❌ Erro ao deletar estado:", error);
    }
  }

  // RESET para menu principal
  static async resetToMainMenu(phone: string): Promise<IUserSession> {
    return await this.setState(phone, "MAIN_MENU", {});
  }

  // SALVAR usuário permanente
  static async saveUser(phone: string, userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.findOneAndUpdate(
        { phone },
        {
          ...userData,
          lastInteraction: new Date(),
        },
        { upsert: true, new: true }
      ).exec();
      
      return user;
    } catch (error) {
      console.error("❌ Erro ao salvar usuário:", error);
      throw error;
    }
  }

  // BUSCAR usuário
  static async getUser(phone: string): Promise<IUser | null> {
    try {
      return await User.findOne({ phone }).exec();
    } catch (error) {
      console.error("❌ Erro ao buscar usuário:", error);
      return null;
    }
  }

  // SALVAR pedido de oração
  static async savePrayerRequest(prayerData: Partial<IPrayerRequest>): Promise<IPrayerRequest> {
    try {
      const prayerRequest = await PrayerRequest.create(prayerData);
      return prayerRequest;
    } catch (error) {
      console.error("❌ Erro ao salvar pedido de oração:", error);
      throw error;
    }
  }

  // BUSCAR pedidos de oração do usuário
  static async getPrayerRequests(phone: string): Promise<IPrayerRequest[]> {
    try {
      return await PrayerRequest.find({ userPhone: phone })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error("❌ Erro ao buscar pedidos de oração:", error);
      return [];
    }
  }

  // ATUALIZAR status do pedido de oração
  static async updatePrayerRequestStatus(
    prayerId: string,
    status: "pendente" | "orado" | "respondido"
  ): Promise<IPrayerRequest | null> {
    try {
      return await PrayerRequest.findByIdAndUpdate(
        prayerId,
        { status, updatedAt: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error("❌ Erro ao atualizar status da oração:", error);
      return null;
    }
  }

  // INCREMENTAR contador de orações
  static async incrementPrayerCount(prayerId: string): Promise<IPrayerRequest | null> {
    try {
      return await PrayerRequest.findByIdAndUpdate(
        prayerId,
        { $inc: { prayerCount: 1 }, updatedAt: new Date() },
        { new: true }
      ).exec();
    } catch (error) {
      console.error("❌ Erro ao incrementar contador de orações:", error);
      return null;
    }
  }

  // LIMPEZA de sessões expiradas
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await UserSession.deleteMany({
        expiresAt: { $lt: new Date() },
      }).exec();
      return result.deletedCount;
    } catch (error) {
      console.error("❌ Erro ao limpar sessões expiradas:", error);
      return 0;
    }
  }

  // ESTATÍSTICAS do sistema
  static async getStats(): Promise<any> {
    try {
      const userCount = await User.countDocuments();
      const sessionCount = await UserSession.countDocuments();
      const prayerCount = await PrayerRequest.countDocuments();
      const activePrayers = await PrayerRequest.countDocuments({ status: "pendente" });

      return {
        totalUsers: userCount,
        activeSessions: sessionCount,
        totalPrayerRequests: prayerCount,
        pendingPrayers: activePrayers,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar estatísticas:", error);
      return {
        totalUsers: 0,
        activeSessions: 0,
        totalPrayerRequests: 0,
        pendingPrayers: 0,
      };
    }
  }

  // BUSCAR todos os usuários (para admin)
  static async getAllUsers(): Promise<IUser[]> {
    try {
      return await User.find().sort({ lastInteraction: -1 }).exec();
    } catch (error) {
      console.error("❌ Erro ao buscar todos os usuários:", error);
      return [];
    }
  }

  // BUSCAR todas as sessões ativas (para admin)
  static async getAllActiveSessions(): Promise<IUserSession[]> {
    try {
      return await UserSession.find({ expiresAt: { $gt: new Date() } })
        .sort({ lastInteraction: -1 })
        .exec();
    } catch (error) {
      console.error("❌ Erro ao buscar sessões ativas:", error);
      return [];
    }
  }
}