// src/services/WhatsAppService.ts
import axios from "axios";
import { config } from "../config/env";
import { logger } from "../config/logger";

export class WhatsAppService {
  // ✅ USE AS VARIÁVEIS DO config (NÃO process.env diretamente)
  private static twilioAccountSid = config.twilioAccountSid;
  private static twilioAuthToken = config.twilioAuthToken;
  private static twilioPhoneNumber = config.twilioWhatsAppNumber;

  static async sendTextMessage(to: string, text: string): Promise<boolean> {
    try {
      // ✅ VERIFICAÇÃO DE CREDENCIAIS
      if (
        !this.twilioAccountSid ||
        !this.twilioAuthToken ||
        !this.twilioPhoneNumber
      ) {
        logger.error("❌ CREDENCIAIS TWILIO NÃO CONFIGURADAS");
        logger.error(`AccountSID: ${this.twilioAccountSid ? "✅" : "❌"}`);
        logger.error(`AuthToken: ${this.twilioAuthToken ? "✅" : "❌"}`);
        logger.error(`PhoneNumber: ${this.twilioPhoneNumber ? "✅" : "❌"}`);
        return false;
      }

      // ✅ TWILIO - Enviar via API Twilio
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          Body: text,
          From: `whatsapp:${this.twilioPhoneNumber}`,
          To: `whatsapp:${to}`,
        }),
        {
          auth: {
            username: this.twilioAccountSid,
            password: this.twilioAuthToken,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 30000,
        }
      );

      logger.info(`✅ Mensagem Twilio ENVIADA para: ${to}`);
      logger.info(`📝 Twilio SID: ${response.data.sid}`);
      return true;
    } catch (error: any) {
      logger.error("❌ ERRO DETALHADO TWILIO:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        to: to,
      });
      return false;
    }
  }

  static async sendInteractiveButtons(
    to: string,
    text: string,
    buttons: any[]
  ): Promise<boolean> {
    // ❌ Twilio não suporta botões interativos nativos
    // ✅ Enviar como texto simples com instruções
    let buttonText = text + "\n\n";

    buttons.forEach((button, index) => {
      buttonText += `\n${index + 1}. ${button.text}`;
    });

    buttonText += "\n\n💡 *Responda com o número da opção*";

    return await this.sendTextMessage(to, buttonText);
  }

  static async sendWelcomeMessage(to: string): Promise<boolean> {
    const welcomeText = `*🏛️ CFC PUSH - Igreja da Família Cristã*

*Bem-vindo(a)!* 🙏

Somos a Igreja da Família Cristã - CFC PUSH, onde *Oramos Até Algo Acontecer!*

Estou aqui para ajudar você. Em breve enviarei o menu de opções...`;

    return await this.sendTextMessage(to, welcomeText);
  }

  // ✅ MÉTODO ADICIONAL: Verificar status das credenciais
  static checkCredentials(): { isValid: boolean; missing: string[] } {
    const missing = [];

    if (!this.twilioAccountSid) missing.push("TWILIO_ACCOUNT_SID");
    if (!this.twilioAuthToken) missing.push("TWILIO_AUTH_TOKEN");
    if (!this.twilioPhoneNumber) missing.push("TWILIO_WHATSAPP_NUMBER");

    return {
      isValid: missing.length === 0,
      missing: missing,
    };
  }
}

export default WhatsAppService;
