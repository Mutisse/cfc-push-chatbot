"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chatRoutes.ts
const express_1 = require("express");
const ChatController_1 = __importDefault(require("../controllers/ChatController")); // ✅ Import correto
const router = (0, express_1.Router)();
const chatController = new ChatController_1.default(); // ✅ Instanciar a classe
// ✅ Apenas POST para webhook Twilio
router.post('/webhook', (req, res) => chatController.handleWebhook(req, res));
exports.default = router;
