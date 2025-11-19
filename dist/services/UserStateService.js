"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStateService = void 0;
const UserSession_1 = require("../models/UserSession");
const User_1 = require("../models/User");
const PrayerRequest_1 = require("../models/PrayerRequest");
class UserStateService {
    // GET estado da sessão
    static async getState(phone) {
        try {
            return await UserSession_1.UserSession.findOne({ phone }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao buscar estado:", error);
            return null;
        }
    }
    // SET estado da sessão
    static async setState(phone, step, data = {}) {
        try {
            const existingSession = await this.getState(phone);
            const updateData = {
                step,
                data: { ...existingSession?.data, ...data },
                lastInteraction: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            };
            return await UserSession_1.UserSession.findOneAndUpdate({ phone }, updateData, {
                upsert: true,
                new: true,
            }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao definir estado:", error);
            throw error;
        }
    }
    // UPDATE apenas dados
    static async updateData(phone, newData) {
        try {
            const existingSession = await this.getState(phone);
            if (!existingSession)
                return null;
            return await UserSession_1.UserSession.findOneAndUpdate({ phone }, {
                data: { ...existingSession.data, ...newData },
                lastInteraction: new Date(),
            }, { new: true }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao atualizar dados:", error);
            return null;
        }
    }
    // DELETE sessão
    static async deleteState(phone) {
        try {
            await UserSession_1.UserSession.deleteOne({ phone }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao deletar estado:", error);
        }
    }
    // RESET para menu principal
    static async resetToMainMenu(phone) {
        return await this.setState(phone, "MAIN_MENU", {});
    }
    // SALVAR usuário permanente
    static async saveUser(phone, userData) {
        try {
            const user = await User_1.User.findOneAndUpdate({ phone }, {
                ...userData,
                lastInteraction: new Date(),
            }, { upsert: true, new: true }).exec();
            return user;
        }
        catch (error) {
            console.error("❌ Erro ao salvar usuário:", error);
            throw error;
        }
    }
    // BUSCAR usuário
    static async getUser(phone) {
        try {
            return await User_1.User.findOne({ phone }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao buscar usuário:", error);
            return null;
        }
    }
    // SALVAR pedido de oração
    static async savePrayerRequest(prayerData) {
        try {
            const prayerRequest = await PrayerRequest_1.PrayerRequest.create(prayerData);
            return prayerRequest;
        }
        catch (error) {
            console.error("❌ Erro ao salvar pedido de oração:", error);
            throw error;
        }
    }
    // BUSCAR pedidos de oração do usuário
    static async getPrayerRequests(phone) {
        try {
            return await PrayerRequest_1.PrayerRequest.find({ userPhone: phone })
                .sort({ createdAt: -1 })
                .exec();
        }
        catch (error) {
            console.error("❌ Erro ao buscar pedidos de oração:", error);
            return [];
        }
    }
    // ATUALIZAR status do pedido de oração
    static async updatePrayerRequestStatus(prayerId, status) {
        try {
            return await PrayerRequest_1.PrayerRequest.findByIdAndUpdate(prayerId, { status, updatedAt: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao atualizar status da oração:", error);
            return null;
        }
    }
    // INCREMENTAR contador de orações
    static async incrementPrayerCount(prayerId) {
        try {
            return await PrayerRequest_1.PrayerRequest.findByIdAndUpdate(prayerId, { $inc: { prayerCount: 1 }, updatedAt: new Date() }, { new: true }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao incrementar contador de orações:", error);
            return null;
        }
    }
    // LIMPEZA de sessões expiradas
    static async cleanupExpiredSessions() {
        try {
            const result = await UserSession_1.UserSession.deleteMany({
                expiresAt: { $lt: new Date() },
            }).exec();
            return result.deletedCount;
        }
        catch (error) {
            console.error("❌ Erro ao limpar sessões expiradas:", error);
            return 0;
        }
    }
    // ESTATÍSTICAS do sistema
    static async getStats() {
        try {
            const userCount = await User_1.User.countDocuments();
            const sessionCount = await UserSession_1.UserSession.countDocuments();
            const prayerCount = await PrayerRequest_1.PrayerRequest.countDocuments();
            const activePrayers = await PrayerRequest_1.PrayerRequest.countDocuments({ status: "pendente" });
            return {
                totalUsers: userCount,
                activeSessions: sessionCount,
                totalPrayerRequests: prayerCount,
                pendingPrayers: activePrayers,
            };
        }
        catch (error) {
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
    static async getAllUsers() {
        try {
            return await User_1.User.find().sort({ lastInteraction: -1 }).exec();
        }
        catch (error) {
            console.error("❌ Erro ao buscar todos os usuários:", error);
            return [];
        }
    }
    // BUSCAR todas as sessões ativas (para admin)
    static async getAllActiveSessions() {
        try {
            return await UserSession_1.UserSession.find({ expiresAt: { $gt: new Date() } })
                .sort({ lastInteraction: -1 })
                .exec();
        }
        catch (error) {
            console.error("❌ Erro ao buscar sessões ativas:", error);
            return [];
        }
    }
}
exports.UserStateService = UserStateService;
