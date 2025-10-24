// src/routes/chatRoutes.ts
import { Router } from 'express';
import ChatController from '../controllers/ChatController'; // ✅ Import correto

const router = Router();
const chatController = new ChatController(); // ✅ Instanciar a classe

// ✅ Apenas POST para webhook Twilio
router.post('/webhook', (req, res) => chatController.handleWebhook(req, res));

export default router;