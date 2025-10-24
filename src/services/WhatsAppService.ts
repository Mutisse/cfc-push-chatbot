// src/services/WhatsAppService.ts
import axios from "axios";
import { config } from "../config/env";
import { logger } from "../config/logger";

export class WhatsAppService {
  private static twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  private static twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  private static twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  static async sendTextMessage(to: string, text: string): Promise<boolean> {
    try {
      // ✅ TWILIO - Enviar via API Twilio
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
        new URLSearchParams({
          Body: text,
          From: `whatsapp:${this.twilioPhoneNumber}`,
          To: `whatsapp:${to}`
        }),
        {
          auth: {
            username: this.twilioAccountSid!,
            password: this.twilioAuthToken!
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );

      logger.info(`✅ Mensagem Twilio ENVIADA para: ${to}`);
      logger.info(`📝 Twilio SID: ${response.data.sid}`);
      return true;

    } catch (error: any) {
      logger.error("❌ ERRO AO ENVIAR VIA TWILIO:", {
        status: error.response?.status,
        error: error.response?.data?.message || error.message,
        to: to
      });
      return false;
    }
  }

  static async sendInteractiveButtons(to: string, text: string, buttons: any[]): Promise<boolean> {
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
}

export default WhatsAppService;