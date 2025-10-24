"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
// src/services/WhatsAppService.ts
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
class WhatsAppService {
    static async sendMessage(message) {
        // Verificar se temos credenciais
        if (!env_1.config.whatsapp.token || env_1.config.whatsapp.token === "seu_token_aqui") {
            logger_1.logger.warn("🔧 WhatsApp em modo de teste - Credenciais não configuradas");
            logger_1.logger.info(`📤 Mensagem simulada para: ${message.to}`);
            // ✅ CORREÇÃO CRÍTICA: Logar conteúdo corretamente
            let content = "Mensagem interativa";
            if (message.text?.body) {
                content = message.text.body.substring(0, 100) + "...";
            }
            else if (message.interactive?.body?.text) {
                content = `Menu: ${message.interactive.body.text.substring(0, 100)}...`;
            }
            logger_1.logger.info(`💬 Conteúdo: ${content}`);
            return true;
        }
        try {
            const response = await axios_1.default.post(`${this.baseURL}/messages`, message, {
                headers: {
                    Authorization: `Bearer ${env_1.config.whatsapp.token}`,
                    "Content-Type": "application/json",
                },
            });
            logger_1.logger.info(`✅ Mensagem enviada para: ${message.to}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error("❌ Erro ao enviar mensagem WhatsApp:", {
                status: error.response?.status,
                data: error.response?.data,
                to: message.to,
            });
            return false;
        }
    }
    static async sendTextMessage(to, text) {
        const message = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: text },
        };
        return await this.sendMessage(message);
    }
    static async sendInteractiveButtons(to, text, buttons) {
        const interactiveMessage = {
            type: "button",
            body: {
                text: text,
            },
            action: {
                buttons: buttons.map((button, index) => ({
                    type: "reply",
                    reply: {
                        id: button.id || `btn_${index + 1}`,
                        title: button.text.substring(0, 20),
                    },
                })),
            },
        };
        const message = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: interactiveMessage,
        };
        return await this.sendMessage(message);
    }
    static async sendWelcomeMessage(to) {
        const welcomeText = `*🏛️ CFC PUSH - Igreja da Família Cristã*

*Bem-vindo(a)!* 🙏

Somos a Igreja da Família Cristã - CFC PUSH, onde *Oramos Até Algo Acontecer!*

Estou aqui para ajudar você. Em breve enviarei o menu de opções...`;
        return await this.sendTextMessage(to, welcomeText);
    }
}
exports.WhatsAppService = WhatsAppService;
WhatsAppService.baseURL = `https://graph.facebook.com/v18.0/${env_1.config.whatsapp.phoneNumberId}`;
exports.default = WhatsAppService;
