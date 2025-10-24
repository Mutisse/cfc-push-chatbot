import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { UserSession } from "../models/UserSession";
import { PrayerRequest } from "../models/PrayerRequest";
import { AssistanceRequest } from "../models/AssistanceRequest";
import { logger } from "../config/logger";

const router = Router();

// Middleware de autenticação para dashboard
const authenticateDashboard = (req: Request, res: Response, next: Function) => {
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
function formatAssistanceType(type: string): string {
  const types: { [key: string]: string } = {
    assistencia_alimentar: "Alimentar",
    assistencia_medica: "Médica",
    assistencia_juridica: "Jurídica",
    assistencia_outra: "Outra",
  };
  return types[type] || type;
}

// Estatísticas gerais
router.get(
  "/stats",
  authenticateDashboard,
  async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        activeSessions,
        prayerRequests,
        assistanceRequests,
        newUsersToday,
      ] = await Promise.all([
        User.countDocuments(),
        UserSession.countDocuments({ expiresAt: { $gt: new Date() } }),
        PrayerRequest.countDocuments(),
        AssistanceRequest.countDocuments(),
        User.countDocuments({
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
    } catch (error) {
      logger.error("Erro ao buscar estatísticas:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// Atividade dos últimos 7 dias
router.get(
  "/activity",
  authenticateDashboard,
  async (req: Request, res: Response) => {
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
        const sessionsCount = await UserSession.countDocuments({
          updatedAt: { $gte: startOfDay, $lte: endOfDay },
        });

        // Contar novos usuários naquele dia
        const newUsersCount = await User.countDocuments({
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
    } catch (error) {
      logger.error("Erro ao buscar atividade:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// Distribuição de pedidos de oração
router.get(
  "/prayers-distribution",
  authenticateDashboard,
  async (req: Request, res: Response) => {
    try {
      const distribution = await PrayerRequest.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
          },
        },
      ]);

      const labels = distribution.map((item) => {
        const types: { [key: string]: string } = {
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
    } catch (error) {
      logger.error("Erro ao buscar distribuição de orações:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// Últimos pedidos de oração
router.get(
  "/recent-prayers",
  authenticateDashboard,
  async (req: Request, res: Response) => {
    try {
      const prayers = await PrayerRequest.find()
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
    } catch (error) {
      logger.error("Erro ao buscar pedidos recentes:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// Últimos usuários cadastrados
router.get(
  "/recent-users",
  authenticateDashboard,
  async (req: Request, res: Response) => {
    try {
      const users = await User.find()
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
    } catch (error) {
      logger.error("Erro ao buscar usuários recentes:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
);

// Solicitações de assistência recentes
router.get(
  "/recent-assistance",
  authenticateDashboard,
  async (req: Request, res: Response) => {
    try {
      const assistanceRequests = await AssistanceRequest.find()
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
    } catch (error) {
      logger.error("Erro ao buscar assistências recentes:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  // rota de teste para ter a certeza dos daod vem ouu nao 
  
);

export { router as dashboardRoutes };
