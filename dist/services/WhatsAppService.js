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
    static async sendTextMessage(to, text) {
        try {
            // ✅ VERIFICAÇÃO DE CREDENCIAIS
            if (!this.twilioAccountSid ||
                !this.twilioAuthToken ||
                !this.twilioPhoneNumber) {
                logger_1.logger.error("❌ CREDENCIAIS TWILIO NÃO CONFIGURADAS");
                logger_1.logger.error(`AccountSID: ${this.twilioAccountSid ? "✅" : "❌"}`);
                logger_1.logger.error(`AuthToken: ${this.twilioAuthToken ? "✅" : "❌"}`);
                logger_1.logger.error(`PhoneNumber: ${this.twilioPhoneNumber ? "✅" : "❌"}`);
                return false;
            }
            // ✅ TWILIO - Enviar via API Twilio
            const response = await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`, new URLSearchParams({
                Body: text,
                From: `whatsapp:${this.twilioPhoneNumber}`,
                To: `whatsapp:${to}`,
            }), {
                auth: {
                    username: this.twilioAccountSid,
                    password: this.twilioAuthToken,
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                timeout: 30000,
            });
            logger_1.logger.info(`✅ Mensagem Twilio ENVIADA para: ${to}`);
            logger_1.logger.info(`📝 Twilio SID: ${response.data.sid}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error("❌ ERRO DETALHADO TWILIO:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                to: to,
            });
            return false;
        }
    }
    static async sendInteractiveButtons(to, text, buttons) {
        // ❌ Twilio não suporta botões interativos nativos
        // ✅ Enviar como texto simples com instruções
        let buttonText = text + "\n\n";
        buttons.forEach((button, index) => {
            buttonText += `\n${index + 1}. ${button.text}`;
        });
        buttonText += "\n\n💡 *Responda com o número da opção*";
        return await this.sendTextMessage(to, buttonText);
    }
    static async sendWelcomeMessage(to) {
        const welcomeText = `*🏛️ CFC PUSH - Igreja da Família Cristã*

*Bem-vindo(a)!* 🙏

Somos a Igreja da Família Cristã - CFC PUSH, onde *Oramos Até Algo Acontecer!*

Estou aqui para ajudar você. Em breve enviarei o menu de opções...`;
        return await this.sendTextMessage(to, welcomeText);
    }
    // ✅ MÉTODO ADICIONAL: Verificar status das credenciais
    static checkCredentials() {
        const missing = [];
        if (!this.twilioAccountSid)
            missing.push("TWILIO_ACCOUNT_SID");
        if (!this.twilioAuthToken)
            missing.push("TWILIO_AUTH_TOKEN");
        if (!this.twilioPhoneNumber)
            missing.push("TWILIO_WHATSAPP_NUMBER");
        return {
            isValid: missing.length === 0,
            missing: missing,
        };
    }
}
exports.WhatsAppService = WhatsAppService;
// ✅ USE AS VARIÁVEIS DO config (NÃO process.env diretamente)
WhatsAppService.twilioAccountSid = env_1.config.twilioAccountSid;
WhatsAppService.twilioAuthToken = env_1.config.twilioAuthToken;
WhatsAppService.twilioPhoneNumber = env_1.config.twilioWhatsAppNumber;
exports.default = WhatsAppService;
