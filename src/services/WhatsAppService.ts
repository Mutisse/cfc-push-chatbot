import twilio from "twilio";
import { logger } from "../config/logger";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !whatsappNumber) {
  throw new Error("Twilio credentials not found in environment variables");
}

const client = twilio(accountSid, authToken);

export class WhatsAppService {
  static async sendTextMessage(to: string, message: string) {
    try {
      await client.messages.create({
        body: message,
        from: `whatsapp:${whatsappNumber}`,
        to: `whatsapp:${to}`,
      });
      logger.info(`✅ Mensagem enviada para ${to}`);
    } catch (error) {
      logger.error(`❌ Erro ao enviar mensagem para ${to}:`, error);
      throw error;
    }
  }

  static async sendInteractiveButtons(
    to: string,
    message: string,
    buttons: any[]
  ) {
    try {
      // Para WhatsApp, usamos mensagens de texto com botões
      const buttonText = buttons
        .map((btn) => `${btn.id}. ${btn.text}`)
        .join("\n");
      const fullMessage = `${message}\n\n${buttonText}`;

      await this.sendTextMessage(to, fullMessage);
    } catch (error) {
      logger.error(`❌ Erro ao enviar botões para ${to}:`, error);
      throw error;
    }
  }

  static async sendWelcomeMessage(to: string) {
    const welcomeMessage = `*Shalom!* 👋\n\nBem-vindo(a) ao *CFC PUSH - Igreja da Família Cristã*!\n\nEstamos felizes por você ter entrado em contato. Em segundos você receberá nosso menu principal.`;

    await this.sendTextMessage(to, welcomeMessage);
  }
}
