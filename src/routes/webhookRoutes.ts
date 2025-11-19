import { Router } from "express";
import { ChatController } from "../controllers/ChatController";

const router = Router();
const chatController = new ChatController();

// Webhook principal do Twilio
router.post("/webhook", chatController.handleWebhook.bind(chatController));

// Rota para teste manual
router.post("/test", chatController.handleWebhook.bind(chatController));

// Rota para enviar mensagem de boas-vindas manualmente
router.post("/welcome/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    await chatController.sendWelcomeMessage(phone);
    res.json({ success: true, message: "Mensagem de boas-vindas enviada" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Erro ao enviar mensagem" });
  }
});

// ✅ EXPORT CORRETO - SEM default
export { router as webhookRouter };
