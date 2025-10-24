"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = require("express");
const User_1 = require("../models/User");
const UserSession_1 = require("../models/UserSession");
const PrayerRequest_1 = require("../models/PrayerRequest");
const AssistanceRequest_1 = require("../models/AssistanceRequest");
const logger_1 = require("../config/logger");
const router = (0, express_1.Router)();
exports.dashboardRoutes = router;
// Middleware de autenticação para dashboard
const authenticateDashboard = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token de autenticação necessário" });
    }
    const token = authHeader.split(" ")[1];
    // Token fixo para a dashboard (em produção, usar JWT)
    if (token !== "cfcpush-dashboard-2025") {
        return res.status(401).json({ error: "Token inválido" });
    }
    next();
};
// Função para formatar tipo de assistência (DEFINIDA ANTES DE SER USADA)
function formatAssistanceType(type) {
    const types = {
        assistencia_alimentar: "Alimentar",
        assistencia_medica: "Médica",
        assistencia_juridica: "Jurídica",
        assistencia_outra: "Outra",
    };
    return types[type] || type;
}
// Estatísticas gerais
router.get("/stats", authenticateDashboard, async (req, res) => {
    try {
        const [totalUsers, activeSessions, prayerRequests, assistanceRequests, newUsersToday,] = await Promise.all([
            User_1.User.countDocuments(),
            UserSession_1.UserSession.countDocuments({ expiresAt: { $gt: new Date() } }),
            PrayerRequest_1.PrayerRequest.countDocuments(),
            AssistanceRequest_1.AssistanceRequest.countDocuments(),
            User_1.User.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            }),
        ]);
        res.json({
            totalUsers,
            activeSessions,
            prayerRequests,
            assistanceRequests,
            newUsersToday,
        });
    }
    catch (error) {
        logger_1.logger.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Atividade dos últimos 7 dias
router.get("/activity", authenticateDashboard, async (req, res) => {
    try {
        const dates = [];
        const messagesData = [];
        const usersData = [];
        // Gerar dados dos últimos 7 dias
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            const dateStr = date.toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "2-digit",
            });
            dates.push(dateStr);
            // Contar sessões ativas naquele dia (simulação de mensagens)
            const sessionsCount = await UserSession_1.UserSession.countDocuments({
                updatedAt: { $gte: startOfDay, $lte: endOfDay },
            });
            // Contar novos usuários naquele dia
            const newUsersCount = await User_1.User.countDocuments({
                createdAt: { $gte: startOfDay, $lte: endOfDay },
            });
            messagesData.push(sessionsCount);
            usersData.push(newUsersCount);
        }
        res.json({
            dates,
            messages: messagesData,
            newUsers: usersData,
        });
    }
    catch (error) {
        logger_1.logger.error("Erro ao buscar atividade:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Distribuição de pedidos de oração
router.get("/prayers-distribution", authenticateDashboard, async (req, res) => {
    try {
        const distribution = await PrayerRequest_1.PrayerRequest.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                },
            },
        ]);
        const labels = distribution.map((item) => {
            const types = {
                saude: "Saúde",
                familia: "Família",
                financas: "Finanças",
                outros: "Outros",
            };
            return types[item._id] || item._id;
        });
        const series = distribution.map((item) => item.count);
        res.json({
            labels,
            series,
        });
    }
    catch (error) {
        logger_1.logger.error("Erro ao buscar distribuição de orações:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Últimos pedidos de oração
router.get("/recent-prayers", authenticateDashboard, async (req, res) => {
    try {
        const prayers = await PrayerRequest_1.PrayerRequest.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("userName type createdAt status")
            .lean();
        const formattedPrayers = prayers.map((prayer) => ({
            name: prayer.userName,
            type: prayer.type.charAt(0).toUpperCase() + prayer.type.slice(1),
            date: prayer.createdAt.toLocaleDateString("pt-PT"),
            status: prayer.status,
        }));
        res.json(formattedPrayers);
    }
    catch (error) {
        logger_1.logger.error("Erro ao buscar pedidos recentes:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Últimos usuários cadastrados
router.get("/recent-users", authenticateDashboard, async (req, res) => {
    try {
        const users = await User_1.User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("name phone createdAt howFoundChurch")
            .lean();
        const formattedUsers = users.map((user) => ({
            name: user.name || "Não informado",
            phone: user.phone,
            date: user.createdAt.toLocaleDateString("pt-PT"),
            source: user.howFoundChurch || "Não informado",
        }));
        res.json(formattedUsers);
    }
    catch (error) {
        logger_1.logger.error("Erro ao buscar usuários recentes:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});
// Solicitações de assistência recentes
router.get("/recent-assistance", authenticateDashboard, async (req, res) => {
    try {
        const assistanceRequests = await AssistanceRequest_1.AssistanceRequest.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("userName type createdAt priority")
            .lean();
        const formattedRequests = assistanceRequests.map((request) => ({
            name: request.userName,
            type: formatAssistanceType(request.type), // CORREÇÃO: Removido o "this."
            date: request.createdAt.toLocaleDateString("pt-PT"),
            priority: request.priority,
        }));
        res.json(formattedRequests);
    }
    catch (error) {
        logger_1.logger.error("Erro ao buscar assistências recentes:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}
// rota de teste para ter a certeza dos daod vem ouu nao 
);
