import { Request, Response } from "express";
import { logger } from "../config/logger";
import { UserStateService } from "../services/UserStateService";
import { WhatsAppService } from "../services/WhatsAppService";
import { MessageProcessorService } from "../services/MessageProcessorService";
import { MessageValidator } from "../validators/MessageValidator";
import { ResponseBuilder } from "../utils/ResponseBuilder";

export class ChatController {
  async handleWebhook(req: Request, res: Response): Promise<void> {
    let userPhone = "";

    try {
      const userMessage = req.body.Body;
      userPhone = req.body.From.replace("whatsapp:", "");

      logger.info(`📱 Mensagem de ${userPhone}: "${userMessage}"`);

      // ✅ VALIDAÇÃO: Ignorar mensagens inválidas
      if (this.shouldIgnoreMessage(userPhone, userMessage)) {
        logger.warn(`⚠️ Mensagem ignorada de: ${userPhone}`);
        this.sendEmptyResponse(res);
        return;
      }

      // Processar mensagem
      const response = await this.processUserMessage(userMessage, userPhone);

      // Enviar resposta via WhatsApp
      await this.sendWhatsAppResponse(
        userPhone,
        response.text,
        response.buttons
      );

      // ✅ Resposta vazia para o Twilio
      this.sendEmptyResponse(res);

      logger.info(`✅ Resposta enviada para ${userPhone}`);
    } catch (error) {
      logger.error("❌ Erro no webhook:", error);
      await this.handleError(userPhone, error);
      this.sendEmptyResponse(res);
    }
  }

  private shouldIgnoreMessage(phone: string, message: string): boolean {
    return (
      phone === "+14155238886" ||
      !message ||
      message === "undefined" ||
      message.trim() === ""
    );
  }

  private async processUserMessage(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const userSession = await UserStateService.getState(phone);
    const currentStep = userSession?.step || "WELCOME";

    // Processar baseado no estado atual
    switch (currentStep) {
      case "WELCOME":
        return await MessageProcessorService.processWelcome(message, phone);

      case "MAIN_MENU":
        return await MessageProcessorService.processMainMenu(message, phone);

      case "CADASTRO_NOME":
        return await MessageProcessorService.handleCadastroNome(message, phone);

      case "CADASTRO_DATA_NASCIMENTO":
        return await MessageProcessorService.handleCadastroDataNascimento(message, phone);

      case "CADASTRO_ESTADO_CIVIL":
        return await MessageProcessorService.handleCadastroEstadoCivil(message, phone);

      case "CADASTRO_ENDERECO":
        return await MessageProcessorService.handleCadastroEndereco(message, phone);

      case "CADASTRO_PROFISSAO":
        return await MessageProcessorService.handleCadastroProfissao(message, phone);

      case "CADASTRO_COMO_CONHECEU":
        return await MessageProcessorService.handleCadastroComoConheceu(message, phone);

      // ✅ CORREÇÃO: Chamar métodos estáticos sem parâmetros quando necessário
      case "ORACAO_TIPO":
        // Se for a primeira vez (sem mensagem específica), mostrar opções
        if (!message || message === "#") {
          return await MessageProcessorService.handleOracaoTipo(phone);
        }
        // Se o usuário escolheu uma opção
        return await this.handleOracaoTipoSelecionada(message, phone);

      case "ORACAO_DETALHE":
        return await MessageProcessorService.handleOracaoDetalhe(message, phone);

      case "ORACAO_ANONIMATO":
        return await MessageProcessorService.handleOracaoAnonimato(message, phone);

      case "ASSISTENCIA_TIPO":
        // Se for a primeira vez (sem mensagem específica), mostrar opções
        if (!message || message === "#") {
          return await MessageProcessorService.handleAssistenciaTipo(phone);
        }
        // Se o usuário escolheu uma opção
        return await this.handleAssistenciaTipoSelecionada(message, phone);

      case "ASSISTENCIA_DETALHE":
        return await MessageProcessorService.handleAssistenciaDetalhe(message, phone);

      case "VISITA_DATA":
        return await MessageProcessorService.handleVisitaData(message, phone);

      case "VISITA_MOTIVO":
        return await MessageProcessorService.handleVisitaMotivo(message, phone);

      case "NUCLEO_REGIAO":
        // Se for a primeira vez (sem mensagem específica), mostrar opções
        if (!message || message === "#") {
          return await MessageProcessorService.handleNucleoRegiao(phone);
        }
        return await this.handleNucleoRegiaoSelecionada(message, phone);

      case "MINISTERIO_TIPO":
        // Se for a primeira vez (sem mensagem específica), mostrar opções
        if (!message || message === "#") {
          return await MessageProcessorService.handleMinisterioTipo(phone);
        }
        return await this.handleMinisterioTipoSelecionada(message, phone);

      case "PUSH_INVEST_MENU":
        return await MessageProcessorService.handlePushInvestMenu(message, phone);

      default:
        return await MessageProcessorService.processWelcome(message, phone);
    }
  }

  // ✅ NOVOS MÉTODOS AUXILIARES PARA PROCESSAR SELEÇÕES
  private async handleOracaoTipoSelecionada(message: string, phone: string) {
    const prayerTypes = ["Saúde", "Família", "Finanças", "Outros"];
    
    if (prayerTypes.includes(message)) {
      await UserStateService.setState(phone, "ORACAO_DETALHE");
      await UserStateService.updateData(phone, {
        prayerType: message.toLowerCase(),
      });
      return {
        text: `✅ *${message}* selecionado!\n\nDescreva seu pedido de oração:`,
      };
    }

    // Se não for uma opção válida, mostrar o menu novamente
    return await MessageProcessorService.handleOracaoTipo(phone);
  }

  private async handleAssistenciaTipoSelecionada(message: string, phone: string) {
    const assistanceTypes = ["Alimentar", "Médica", "Jurídica", "Outra"];
    
    if (assistanceTypes.includes(message)) {
      await UserStateService.setState(phone, "ASSISTENCIA_DETALHE");
      await UserStateService.updateData(phone, { assistanceType: message });
      return {
        text: `✅ *Assistência ${message}* selecionada!\n\nDescreva sua necessidade:`,
      };
    }

    // Se não for uma opção válida, mostrar o menu novamente
    return await MessageProcessorService.handleAssistenciaTipo(phone);
  }

  private async handleNucleoRegiaoSelecionada(message: string, phone: string) {
    const regions = ["Zona Norte", "Zona Sul", "Zona Leste", "Zona Oeste", "Centro"];
    
    if (regions.includes(message)) {
      await UserStateService.updateData(phone, { selectedRegion: message });
      await UserStateService.resetToMainMenu(phone);
      
      const regionInfo: { [key: string]: string } = {
        "Zona Norte": "Responsável: Irmão João - 📞 +258 84 111 1111",
        "Zona Sul": "Responsável: Irmã Maria - 📞 +258 84 222 2222", 
        "Zona Leste": "Responsável: Irmão Pedro - 📞 +258 84 333 3333",
        "Zona Oeste": "Responsável: Irmã Ana - 📞 +258 84 444 4444",
        "Centro": "Responsável: Irmão Carlos - 📞 +258 84 555 5555"
      };
      
      return {
        text: `✅ *Núcleo ${message}*\n\n${regionInfo[message]}\n\nO responsável entrará em contato para integrá-lo ao núcleo!\n\nDigite [#] para menu principal.`
      };
    }

    return await MessageProcessorService.handleNucleoRegiao(phone);
  }

  private async handleMinisterioTipoSelecionada(message: string, phone: string) {
    const ministries = ["Louvor e Adoração", "Intercessão", "CFC Youth", "CFC Kids", "Social"];
    
    if (ministries.includes(message)) {
      await UserStateService.updateData(phone, { selectedMinistry: message });
      await UserStateService.resetToMainMenu(phone);
      
      const ministryInfo: { [key: string]: string } = {
        "Louvor e Adoração": "🎵 *Ministério de Louvor*\n\nEnsaio: Quintas 18h\nContato: +258 84 666 6666",
        "Intercessão": "🙏 *Ministério de Intercessão*\n\nEncontro: Segundas 17h\nContato: +258 84 777 7777",
        "CFC Youth": "🔥 *CFC Youth (15-30 anos)*\n\nEncontro: Sextas 19h\nContato: +258 84 888 8888",
        "CFC Kids": "👶 *CFC Kids (3-12 anos)*\n\nEscola Dominical: Domingos 9h\nContato: +258 84 999 9999",
        "Social": "🤝 *Ministério Social*\n\nReunião: Terças 16h\nContato: +258 84 000 0000"
      };
      
      return {
        text: `✅ *${message}*\n\n${ministryInfo[message]}\n\nO líder do ministério entrará em contato!\n\nDigite [#] para menu principal.`
      };
    }

    return await MessageProcessorService.handleMinisterioTipo(phone);
  }

  // ✅ MÉTODOS DE COMUNICAÇÃO
  private async sendWhatsAppResponse(
    phone: string,
    text: string,
    buttons?: any[]
  ): Promise<void> {
    try {
      if (buttons && buttons.length > 0) {
        await WhatsAppService.sendInteractiveButtons(phone, text, buttons);
      } else {
        await WhatsAppService.sendTextMessage(phone, text);
      }
    } catch (error) {
      logger.error(`❌ Erro ao enviar mensagem para ${phone}:`, error);
      throw error;
    }
  }

  private async handleError(phone: string, error: any): Promise<void> {
    try {
      if (phone && phone.trim() !== "") {
        await WhatsAppService.sendTextMessage(
          phone,
          "❌ Desculpe, ocorreu um erro no servidor. Por favor, tente novamente em alguns instantes."
        );
      } else {
        logger.warn("⚠️ Não foi possível enviar mensagem de erro: phone vazio");
      }
    } catch (whatsappError) {
      logger.error("❌ Erro ao enviar mensagem de erro:", whatsappError);
    }
  }

  private sendEmptyResponse(res: Response): void {
    res.type("text/xml");
    res.send(ResponseBuilder.buildEmptyResponse());
  }

  // ✅ MÉTODO PÚBLICO PARA ENVIAR MENSAGEM DE BOAS-VINDAS
  public async sendWelcomeMessage(phone: string): Promise<void> {
    try {
      await WhatsAppService.sendWelcomeMessage(phone);

      // Aguardar e enviar menu principal
      setTimeout(async () => {
        const welcomeResponse = await MessageProcessorService.processWelcome(
          "",
          phone
        );
        await this.sendWhatsAppResponse(
          phone,
          welcomeResponse.text,
          welcomeResponse.buttons
        );
      }, 2000);
    } catch (error) {
      logger.error(`❌ Erro ao enviar boas-vindas para ${phone}:`, error);
    }
  }
}

export default ChatController;