// src/controllers/ChatController.ts
import { Request, Response } from "express";
import { logger } from "../config/logger";
import { UserStateService } from "../services/UserStateService";
import { WhatsAppService } from "../services/WhatsAppService";
import { MenuManager } from "../models/MenuManager";

export class ChatController {
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      // ✅ FORMATO TWILIO - Corrigir extração de dados
      const userMessage = req.body.Body;
      const userPhone = req.body.From.replace("whatsapp:", "");

      logger.info(`📱 Mensagem de ${userPhone}: "${userMessage}"`);

      // ✅ VALIDAÇÃO: Ignorar mensagens do próprio sistema Twilio
      if (
        userPhone === "+14155238886" ||
        !userMessage ||
        userMessage === "undefined" ||
        userMessage.trim() === ""
      ) {
        logger.warn(`⚠️ Mensagem inválida ignorada de: ${userPhone}`);

        const emptyResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`;

        res.type("text/xml");
        res.send(emptyResponse);
        return;
      }

      // Buscar estado atual do usuário
      const userSession = await UserStateService.getState(userPhone);
      const currentStep = userSession?.step || "WELCOME";

      let responseText = "";
      let buttons: any[] = [];

      // ✅ CORRIGIR: Processar mensagem baseada no estado atual
      switch (currentStep) {
        case "WELCOME":
          const welcomeResponse = await this.handleWelcome(
            userMessage,
            userPhone
          );
          responseText = welcomeResponse.text;
          buttons = welcomeResponse.buttons || [];
          break;

        case "MAIN_MENU":
          const mainMenuResponse = await this.handleMainMenu(
            userMessage,
            userPhone
          );
          responseText = mainMenuResponse.text;
          buttons = mainMenuResponse.buttons || [];
          break;

        case "PUSH_INVEST_MENU":
          const pushInvestResponse = await this.handlePushInvestMenu(
            userMessage,
            userPhone
          );
          responseText = pushInvestResponse.text;
          buttons = pushInvestResponse.buttons || [];
          break;

        case "PUSH_INVEST_PROJETOS":
          responseText = await this.handlePushInvestProjetos(
            userMessage,
            userPhone
          );
          break;

        case "PUSH_INVEST_INVESTIR":
          responseText = await this.handlePushInvestInvestir(
            userMessage,
            userPhone
          );
          break;

        case "PUSH_INVEST_CONTATO":
          responseText = await this.handlePushInvestContato(
            userMessage,
            userPhone
          );
          break;

        case "CADASTRO_NOME":
          responseText = await this.handleCadastroNome(userMessage, userPhone);
          break;

        case "CADASTRO_DATA_NASCIMENTO":
          responseText = await this.handleCadastroDataNascimento(
            userMessage,
            userPhone
          );
          break;

        case "CADASTRO_ESTADO_CIVIL":
          responseText = await this.handleCadastroEstadoCivil(
            userMessage,
            userPhone
          );
          break;

        case "CADASTRO_ENDERECO":
          responseText = await this.handleCadastroEndereco(
            userMessage,
            userPhone
          );
          break;

        case "CADASTRO_PROFISSAO":
          responseText = await this.handleCadastroProfissao(
            userMessage,
            userPhone
          );
          break;

        case "CADASTRO_COMO_CONHECEU":
          responseText = await this.handleCadastroComoConheceu(
            userMessage,
            userPhone
          );
          break;

        case "ORACAO_TIPO":
          const oracaoResponse = await this.handleOracaoTipo(
            userMessage,
            userPhone
          );
          responseText = oracaoResponse.text;
          buttons = oracaoResponse.buttons || [];
          break;

        case "ORACAO_DETALHE":
          responseText = await this.handleOracaoDetalhe(userMessage, userPhone);
          break;

        case "ORACAO_ANONIMATO":
          responseText = await this.handleOracaoAnonimato(
            userMessage,
            userPhone
          );
          break;

        case "ORACAO_NOME_FAMILIA":
          responseText = await this.handleOracaoNomeFamilia(
            userMessage,
            userPhone
          );
          break;

        case "VISITA_DATA":
          responseText = await this.handleVisitaData(userMessage, userPhone);
          break;

        case "VISITA_MOTIVO":
          responseText = await this.handleVisitaMotivo(userMessage, userPhone);
          break;

        case "NUCLEO_REGIAO":
          const nucleoResponse = await this.handleNucleoRegiao(
            userMessage,
            userPhone
          );
          responseText = nucleoResponse.text;
          buttons = nucleoResponse.buttons || [];
          break;

        case "MINISTERIO_TIPO":
          const ministerioResponse = await this.handleMinisterioTipo(
            userMessage,
            userPhone
          );
          responseText = ministerioResponse.text;
          buttons = ministerioResponse.buttons || [];
          break;

        case "ASSISTENCIA_TIPO":
          const assistenciaResponse = await this.handleAssistenciaTipo(
            userMessage,
            userPhone
          );
          responseText = assistenciaResponse.text;
          buttons = assistenciaResponse.buttons || [];
          break;

        case "ASSISTENCIA_DETALHE":
          responseText = await this.handleAssistenciaDetalhe(
            userMessage,
            userPhone
          );
          break;

        case "TRANSFERENCIA_IGREJA_ORIGEM":
          responseText = await this.handleTransferenciaIgrejaOrigem(
            userMessage,
            userPhone
          );
          break;

        case "TRANSFERENCIA_MOTIVO":
          responseText = await this.handleTransferenciaMotivo(
            userMessage,
            userPhone
          );
          break;

        case "ATUALIZACAO_DADOS_TIPO":
          responseText = await this.handleAtualizacaoDadosTipo(
            userMessage,
            userPhone
          );
          break;

        case "ATUALIZACAO_DADOS_NOVO_VALOR":
          responseText = await this.handleAtualizacaoDadosNovoValor(
            userMessage,
            userPhone
          );
          break;

        case "DIREITOS_DEVERES":
          responseText = await this.handleDireitosDeveres(
            userMessage,
            userPhone
          );
          break;

        default:
          const defaultResponse = await this.handleWelcome(
            userMessage,
            userPhone
          );
          responseText = defaultResponse.text;
          buttons = defaultResponse.buttons || [];
      }

      // ✅ ENVIAR VIA WHATSAPP SERVICE
      await this.sendWhatsAppMessage(userPhone, responseText, buttons);

      // ✅ Resposta vazia para o Twilio (IMPORTANTE para Twilio)
      const emptyResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`;

      res.type("text/xml");
      res.send(emptyResponse);

      logger.info(
        `✅ Resposta enviada via WhatsApp para ${userPhone}: ${currentStep}`
      );
    } catch (error) {
      logger.error("❌ Erro no webhook:", error);

      // ✅ Tentar enviar mensagem de erro via WhatsApp
      try {
        const userPhone = req.body.From
          ? req.body.From.replace("whatsapp:", "")
          : "unknown";
        await WhatsAppService.sendTextMessage(
          userPhone,
          "❌ Desculpe, ocorreu um erro no servidor. Por favor, tente novamente."
        );
      } catch (whatsappError) {
        logger.error(
          "❌ Erro ao enviar mensagem de erro via WhatsApp:",
          whatsappError
        );
      }

      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`;

      res.type("text/xml");
      res.send(errorTwiml);
    }
  }

  // ✅ MÉTODO: Enviar mensagem via WhatsAppService (CORRIGIDO)
  private async sendWhatsAppMessage(
    phone: string,
    text: string,
    buttons?: any[]
  ): Promise<void> {
    try {
      if (buttons && buttons.length > 0) {
        // Se tem botões, enviar mensagem interativa
        await WhatsAppService.sendInteractiveButtons(phone, text, buttons);
      } else {
        // Se não tem botões, enviar mensagem de texto simples
        await WhatsAppService.sendTextMessage(phone, text);
      }
    } catch (error) {
      logger.error(`❌ Erro ao enviar mensagem WhatsApp para ${phone}:`, error);
      throw error;
    }
  }

  // ✅ MÉTODO: Enviar mensagem de boas-vindas inicial
  public async sendWelcomeMessage(phone: string): Promise<void> {
    try {
      await WhatsAppService.sendWelcomeMessage(phone);

      // Aguardar 2 segundos e enviar o menu principal
      setTimeout(async () => {
        const welcomeResponse = await this.handleWelcome("", phone);
        await this.sendWhatsAppMessage(
          phone,
          welcomeResponse.text,
          welcomeResponse.buttons
        );
      }, 2000);
    } catch (error) {
      logger.error(
        `❌ Erro ao enviar mensagem de boas-vindas para ${phone}:`,
        error
      );
    }
  }

  // 🎯 MENSAGEM DE BOAS-VINDAS COM BOTÕES
  private async handleWelcome(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    await UserStateService.setState(phone, "MAIN_MENU");

    const welcomeText = `🏛️ *CFC PUSH - Igreja da Família Cristã*\n\nShalom! 👋 Agradecemos por entrar em contato connosco. Somos a Igreja da Família Cristã - CFC PUSH - *Onde Oramos Até Algo Acontecer!*\n\n*Para continuar, selecione uma das opções abaixo:*\n\n💡 *Navegação rápida:*\nDigite [#] para voltar ao menu principal`;

    const buttons = [
      { id: "1", text: "📝 Ser Membro" },
      { id: "2", text: "🙏 Oração" },
      { id: "3", text: "👨‍💼 Pastor" },
      { id: "4", text: "⏰ Cultos" },
      { id: "5", text: "💝 Contribuir" },
      { id: "6", text: "🏠 Visita" },
      { id: "7", text: "🤝 Assistência" },
      { id: "8", text: "🔔 Núcleos" },
      { id: "9", text: "🎵 Ministérios" },
      { id: "10", text: "🎯 Evangelização" },
      { id: "11", text: "🤝 Servos" },
      { id: "12", text: "🛍️ Loja" },
      { id: "13", text: "📍 Localização" },
      { id: "14", text: "💰 PUSH Invest" },
      { id: "15", text: "❌ Encerrar" },
    ];

    return {
      text: welcomeText,
      buttons: buttons,
    };
  }

  // 🎯 MANIPULAR MENU PRINCIPAL
  private async handleMainMenu(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const normalizedMessage = message.trim();

    // ✅ CORRIGIR: Tratamento de saudações
    const saudações = [
      "shalom",
      "bom dia",
      "boa tarde",
      "boa noite",
      "olá",
      "ola",
      "salve",
      "oi",
      "hi",
      "hello",
    ];
    if (saudações.includes(normalizedMessage.toLowerCase())) {
      return await this.handleWelcome("", phone);
    }

    // Navegação rápida
    if (normalizedMessage === "#") {
      return await this.handleWelcome("", phone);
    }

    // Opções principais
    if (this.isValidMenuOption(normalizedMessage, 1, 15)) {
      switch (normalizedMessage) {
        case "1":
          return await this.handleSerMembroSubmenu(phone);

        case "2":
          return await this.handleOracaoTipo("", phone);

        case "3":
          return {
            text: `👨‍💼 *FALAR COM PASTOR*\n\n*Contatos Diretos:*\n📞 Telefone: +258 84 123 4567\n✉️ E-mail: pastor@cfcpush.org\n\n*Horários de Atendimento:*\nSegunda a Sexta: 14h-18h\nSábado: 9h-12h\n\n*Local:* Gabinete Pastoral - Sede CFC PUSH\n\nDigite [#] para menu principal`,
          };

        case "4":
          return {
            text: `⏰ *CULTOS E HORÁRIOS*\n\n*Horários Regulares:*\n\n📅 *DOMINGO*\n8h30 - Culto de Celebração Principal\n\n📅 *QUARTA-FEIRA*\n18h00 - Oração e Estudo Bíblico\n\n📅 *SEXTA-FEIRA*\n18h00 - CFC PUSH Jovens\n\n📅 *SÁBADO*\n16h00 - Escola Bíblica e Discipulado\n\n*Eventos Especiais:*\n• Vigílias Mensais\n• Conferências Trimestrais\n• Batismos (consulte datas)\n\n*Transmissão Online:*\nDisponível em nosso site\n\nDigite [#] para menu principal`,
          };

        case "5":
          return {
            text: `💝 *CONTRIBUIÇÕES E DOAÇÕES*\n\n*Agradecemos sua generosidade!*\n\n*Métodos de Contribuição:*\n\n🏦 *Transferência Bancária:*\nBanco: BCI\nConta: 123456789012\nNIB: 0008000123456789012\n\n📱 *Mobile Money (M-Pesa):*\nNúmero: +258 84 500 6000\nNome: CFC PUSH Igreja\n\n💵 *Coleta nos Cultos:*\nDurante os cultos presenciais\n\n*Transparência:*\nRelatórios financeiros disponíveis mensalmente\n\nDigite [#] para menu principal`,
          };

        case "6":
          await UserStateService.setState(phone, "VISITA_DATA");
          return {
            text: "🏠 *VISITA PASTORAL*\n\nQual a melhor *data* para visita? (ex: 25/12/2024)\n\n*Formato:* DD/MM/AAAA",
          };

        case "7":
          return await this.handleAssistenciaTipo("", phone);

        case "8":
          return await this.handleNucleoRegiao("", phone);

        case "9":
          return await this.handleMinisterioTipo("", phone);

        case "10":
          return {
            text: `🎯 *CAMPANHAS DE EVANGELIZAÇÃO*\n\n*Próximos Eventos:*\n\n🔹 *Evangelismo de Rua*\nSábado, 15h00 - Centro da Cidade\n\n🔹 *Visitação Hospitalar*\nQuintas, 10h00 - Hospital Central\n\n🔹 *Campanha Jovens*\nSextas, 18h00 - Sede CFC PUSH\n\n*Como Participar:*\nCompareça aos treinamentos ou entre em contato com o Ministério de Evangelização\n\n📞 Contato: +258 84 700 8000\n\nDigite [#] para menu principal`,
          };

        case "11":
          return {
            text: `🤝 *SERVIÇO E VOLUNTARIADO*\n\n*Áreas de Serviço Disponíveis:*\n\n• Recepção e Acolhimento\n• Limpeza e Manutenção\n• Mídia e Tecnologia\n• Intercessão e Oração\n• Evangelismo e Missões\n• Ação Social\n\n*Treinamentos:*\nPrimeiro Sábado de cada mês, 14h00\n\n*Contato:*\n📞 +258 84 900 1000\n✉️ servos@cfcpush.org\n\nDigite [#] para menu principal`,
          };

        case "12":
          return {
            text: `🛍️ *CENTRAL STORE CFC PUSH*\n\n*Produtos Disponíveis:*\n\n📚 *Livros e Bíblias:*\n• Bíblias de Estudo\n• Livros Cristãos\n• Devocionais\n\n🎵 *Mídia e Música:*\n• CDs de Louvor\n• DVDs de Pregações\n• Mensagens em Áudio\n\n👕 *Produtos Personalizados:*\n• Camisetas CFC PUSH\n• Canecas e Acessórios\n• Material de Escola Bíblica\n\n*Encomendas:*\n📞 +258 84 600 7000\n✉️ store@cfcpush.org\n\n*Local:* Sede CFC PUSH - Loja\n\nDigite [#] para menu principal`,
          };

        case "13":
          return {
            text: `📍 *LOCALIZAÇÃO E CONTATO*\n\n*Endereço da Sede:*\n🏛️ CFC PUSH - Igreja da Família Cristã\nAv. 25 de Setembro, 1234\nMaputo, Moçambique\n\n*Coordenadas GPS:*\n-25.9689, 32.5695\n\n*Como Chegar:*\n🚌 *Transporte Público:*\n• Chapas: Linhas 25, 32, 44\n• Paragem: Av. 25 de Setembro\n\n🚗 *Estacionamento:*\nGratuito disponível no local\n\n*Contatos Gerais:*\n📞 +258 84 300 4000\n✉️ info@cfcpush.org\n🌐 www.cfcpush.org\n\nDigite [#] para menu principal`,
          };

        // ✅ CORREÇÃO: Opção 14 = PUSH Invest, Opção 15 = Encerrar
        case "14":
          await UserStateService.setState(phone, "PUSH_INVEST_MENU");
          return await this.handlePushInvestMenu("", phone);

        case "15":
          await UserStateService.deleteState(phone);
          return {
            text: "👋 *ATENDIMENTO ENCERRADO!*\n\nObrigado por contactar a *CFC PUSH - Igreja da Família Cristã*! 🙏\n\nQue Deus te abençoe ricamente e estamos sempre aqui para servir!\n\n*Shalom!* ✨\n\nPara reiniciar, digite qualquer mensagem.",
          };

        default:
          return {
            text: '❌ Opção inválida. Digite um número de 1 a 15 ou "#" para menu.',
          };
      }
    }

    // Se não for uma opção numérica, verificar se é texto dos botões
    const buttonResponses: { [key: string]: string } = {
      "ser membro": "1",
      oração: "2",
      pastor: "3",
      cultos: "4",
      contribuir: "5",
      visita: "6",
      assistência: "7",
      núcleos: "8",
      ministérios: "9",
      evangelização: "10",
      servos: "11",
      loja: "12",
      localização: "13",
      "push invest": "14",
      encerrar: "15",
    };

    const lowerMessage = normalizedMessage.toLowerCase();
    if (buttonResponses[lowerMessage]) {
      // Recursivamente processar a opção correspondente
      return await this.handleMainMenu(buttonResponses[lowerMessage], phone);
    }

    return {
      text: '❌ Opção não reconhecida. Digite "#" para ver o menu principal.',
    };
  }

  // 🎯 SER MEMBRO - SUBMENU COM BOTÕES
  private async handleSerMembroSubmenu(
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const buttons = [
      { id: "Novo Membro", text: "📝 Novo Membro" },
      { id: "Transferência", text: "🔄 Transferência" },
      { id: "Atualizar Dados", text: "✏️ Atualizar Dados" },
      { id: "Direitos e Deveres", text: "📋 Direitos/Deveres" },
      { id: "#", text: "🏠 Menu Principal" },
    ];

    return {
      text: `🎯 *SER MEMBRO CFC PUSH*\n\n*Como podemos ajudá-lo?*\n\nClique na opção desejada:`,
      buttons: buttons,
    };
  }

  // 🎯 NOVA SEÇÃO: PUSH INVEST - MENU PRINCIPAL
  private async handlePushInvestMenu(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const normalizedMessage = message.trim();

    // Se o usuário já selecionou uma opção
    if (normalizedMessage === "Voltar" || normalizedMessage === "#") {
      await UserStateService.setState(phone, "MAIN_MENU");
      return await this.handleMainMenu("", phone);
    }

    const opcoesPushInvest: { [key: string]: string } = {
      projetos: "PUSH_INVEST_PROJETOS",
      investir: "PUSH_INVEST_INVESTIR",
      contato: "PUSH_INVEST_CONTATO",
    };

    if (
      normalizedMessage &&
      opcoesPushInvest[normalizedMessage.toLowerCase()]
    ) {
      const opcao = normalizedMessage.toLowerCase();
      await UserStateService.setState(phone, opcoesPushInvest[opcao]);

      switch (opcao) {
        case "projetos":
          return {
            text: `💰 *PUSH INVEST - PROJETOS*\n\n*Em Breve!* 🚧\n\nEstamos preparando projetos incríveis de investimento e desenvolvimento para nossa comunidade.\n\n*Fique atento às novidades!*\n\nEm breve teremos:\n• Projetos imobiliários\n• Investimentos comunitários\n• Programas de desenvolvimento\n\nDigite [#] para voltar ao menu principal.`,
          };

        case "investir":
          return {
            text: `💰 *PUSH INVEST - COMO INVESTIR*\n\n*Informação em Desenvolvimento* 📈\n\nNossa equipe está trabalhando nas melhores oportunidades de investimento para você.\n\n*Volte em breve para conhecer:*\n• Modalidades de investimento\n• Retornos esperados\n• Processo de participação\n\nDigite [#] para voltar ao menu principal.`,
          };

        case "contato":
          return {
            text: `💰 *PUSH INVEST - CONTATO*\n\n*Equipe Especializada* 👨‍💼\n\nPara informações sobre investimentos, entre em contato com nossa equipe:\n\n📞 *Telefone:* +258 84 500 6000\n✉️ *Email:* invest@cfcpush.org\n🏛️ *Escritório:* Sede CFC PUSH\n\n*Horário de Atendimento:*\nSegunda a Sexta: 9h-17h\nSábado: 9h-12h\n\nDigite [#] para voltar ao menu principal.`,
          };
      }
    }

    // Mostrar opções com botões
    const buttons = [
      { id: "Projetos", text: "📊 Projetos" },
      { id: "Investir", text: "💵 Investir" },
      { id: "Contato", text: "📞 Contato" },
      { id: "Voltar", text: "↩️ Voltar" },
    ];

    return {
      text: `💰 *PUSH INVEST - INVESTIMENTOS CFC*\n\n*Crescimento com Propósito* 🌱\n\nBem-vindo ao PUSH Invest - nosso departamento de investimentos e desenvolvimento financeiro.\n\n*O que você gostaria de saber?*\n\n💡 *Navegação:* Digite [#] para menu principal`,
      buttons: buttons,
    };
  }

  // 🎯 PUSH INVEST - PROJETOS
  private async handlePushInvestProjetos(
    message: string,
    phone: string
  ): Promise<string> {
    await UserStateService.resetToMainMenu(phone);

    return `💰 *PUSH INVEST - PROJETOS*\n\n*Em Desenvolvimento* 🚧\n\nEstamos criando oportunidades de investimento que beneficiem nossa comunidade e glorifiquem a Deus.\n\n*Áreas de Atuação Futura:*\n• Desenvolvimento imobiliário\n• Projetos comunitários\n• Investimentos sustentáveis\n• Programas de microcrédito\n\n📞 *Para mais informações:*\n+258 84 500 6000\ninvest@cfcpush.org\n\n*Volte em breve para novidades!*\n\nDigite [#] para menu principal.`;
  }

  // 🎯 PUSH INVEST - INVESTIR
  private async handlePushInvestInvestir(
    message: string,
    phone: string
  ): Promise<string> {
    await UserStateService.resetToMainMenu(phone);

    return `💰 *PUSH INVEST - COMO INVESTIR*\n\n*Informações em Desenvolvimento* 📈\n\nEstamos estruturando as melhores opções de investimento para nossos membros e parceiros.\n\n*Em Breve Ofereceremos:*\n• Diversas modalidades\n• Planos de investimento\n• Acompanhamento profissional\n• Transparência total\n\n💼 *Contato para Investidores:*\n📞 +258 84 500 6000\n✉️ invest@cfcpush.org\n\n*Deus abençoe seus investimentos!*\n\nDigite [#] para menu principal.`;
  }

  // 🎯 PUSH INVEST - CONTATO
  private async handlePushInvestContato(
    message: string,
    phone: string
  ): Promise<string> {
    await UserStateService.resetToMainMenu(phone);

    return `💰 *PUSH INVEST - CONTATO*\n\n*Fale com Nossa Equipe* 👨‍💼\n\n*Coordenação PUSH Invest:*\nIrmão João Investimentos\n\n📞 *Telefone:* +258 84 500 6000\n✉️ *Email:* invest@cfcpush.org\n🏛️ *Endereço:* Sede CFC PUSH\nAv. 25 de Setembro, 1234\nMaputo\n\n*Horário de Atendimento:*\nSegunda a Sexta: 9h-17h\nSábado: 9h-12h\n\n*Estamos aqui para ajudar!*\n\nDigite [#] para menu principal.`;
  }

  // 🎯 NÚCLEO - REGIÃO COM BOTÕES
  private async handleNucleoRegiao(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const regions: { [key: string]: { info: string; contato: string } } = {
      "Zona Norte": {
        info: "🔔 *NÚCLEO ZONA NORTE*\n\n*Responsável:* Irmão João\n📞 +258 84 123 4567\n\n*Local de Reunião:*\nCentro Comunitário do Bairro\nAv. Norte, 567\n\n*Horários:*\nQuintas: 18h00 - Estudo Bíblico\nDomingos: 16h00 - Celebração",
        contato: "+258841234567",
      },
      "Zona Sul": {
        info: "🔔 *NÚCLEO ZONA SUL*\n\n*Responsável:* Irmã Maria\n📞 +258 84 234 5678\n\n*Local de Reunião:*\nCasa de Família\nRua Sul, 890\n\n*Horários:*\nTerças: 18h00 - Oração\nSábados: 17h00 - Comunhão",
        contato: "+258842345678",
      },
      "Zona Leste": {
        info: "🔔 *NÚCLEO ZONA LESTE*\n\n*Responsável:* Irmão Pedro\n📞 +258 84 345 6789\n\n*Local de Reunião:*\nEscola Primária\nAv. Leste, 123\n\n*Horários:*\nQuartas: 17h30 - Estudo\nDomingos: 15h00 - Culto",
        contato: "+258843456789",
      },
      "Zona Oeste": {
        info: "🔔 *NÚCLEO ZONA OESTE*\n\n*Responsável:* Irmã Ana\n📞 +258 84 456 7890\n\n*Local de Reunião:*\nSalão Paroquial\nRua Oeste, 456\n\n*Horários:*\nSegundas: 18h00 - Intercessão\nSextas: 17h00 - Jovens",
        contato: "+258844567890",
      },
      Centro: {
        info: "🔔 *NÚCLEO CENTRO*\n\n*Responsável:* Irmão Carlos\n📞 +258 84 567 8901\n\n*Local de Reunião:*\nSede CFC PUSH\nAv. 25 de Setembro, 1234\n\n*Horários:*\nDiariamente - Programação Principal\nConsulte horários dos cultos",
        contato: "+258845678901",
      },
    };

    // Se o usuário já selecionou uma região
    if (message && regions[message]) {
      await UserStateService.resetToMainMenu(phone);
      return {
        text: `${regions[message].info}\n\n📍 *Como Participar:*\nEntre em contato com o responsável ou compareça a uma reunião!\n\nDigite [#] para menu principal.`,
      };
    }

    // Mostrar opções com botões
    const buttons = [
      { id: "Zona Norte", text: "📍 Zona Norte" },
      { id: "Zona Sul", text: "📍 Zona Sul" },
      { id: "Zona Leste", text: "📍 Zona Leste" },
      { id: "Zona Oeste", text: "📍 Zona Oeste" },
      { id: "Centro", text: "📍 Centro" },
      { id: "#", text: "🏠 Menu Principal" },
    ];

    return {
      text: `🔔 *REDE DE NÚCLEOS CFC PUSH*\n\nEm qual *região* você mora? *Clique no botão da sua região:*\n\nEncontre o núcleo mais próximo de você!`,
      buttons: buttons,
    };
  }

  // 🎯 MINISTÉRIOS COM BOTÕES
  private async handleMinisterioTipo(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const ministerios: { [key: string]: { info: string; contato: string } } = {
      "Louvor e Adoração": {
        info: `🎵 *MINISTÉRIO DE LOUVOR E ADORAÇÃO*\n\n*Responsável:* Irmão João Silva\n📞 +258 84 123 4567\n✉️ louvor@cfcpush.org\n\n*Descrição:*\nMinistério dedicado à música, canto e adoração através das artes. Preparamos os momentos de louvor dos cultos e eventos especiais.\n\n*Requisitos:*\n• Habilidade musical ou vocal\n• Compromisso com ensaios\n• Vida de adoração\n\n*Horários:*\nEnsaios: Quintas 19h00\nApresentações: Domingos e eventos`,
        contato: "+258841234567",
      },
      Intercessão: {
        info: `🙏 *MINISTÉRIO DE INTERCESSÃO*\n\n*Responsável:* Irmã Maria Santos\n📞 +258 84 234 5678\n✉️ intercessao@cfcpush.org\n\n*Descrição:*\nGrupo de oração que intercede pela igreja, liderança, membros e necessidades específicas. Vigílias e cadeias de oração.\n\n*Requisitos:*\n• Vida de oração\n• Compromisso com horários\n• Discrição e fé\n\n*Horários:*\nReuniões: Segundas 18h00\nVigílias: Último Sábado do mês`,
        contato: "+258842345678",
      },
      "CFC Youth": {
        info: `🔥 *CFC YOUTH - MINISTÉRIO JOVEM*\n\n*Responsável:* Irmão Pedro Mondlane\n📞 +258 84 345 6789\n✉️ youth@cfcpush.org\n\n*Descrição:*\nMinistério para jovens de 15-30 anos. Encontros, estudos, eventos sociais e projetos missionários.\n\n*Requisitos:*\n• Idade: 15-30 anos\n• Vontade de servir\n• Participação ativa\n\n*Horários:*\nCulto Jovem: Sextas 18h00\nEncontros: Sábados 15h00`,
        contato: "+258843456789",
      },
      "CFC Kids": {
        info: `👶 *CFC KIDS - MINISTÉRIO INFANTIL*\n\n*Responsável:* Irmã Ana Pereira\n📞 +258 84 456 7890\n✉️ kids@cfcpush.org\n\n*Descrição:*\nMinistério para crianças de 3-12 anos. Escola Bíblica Infantil, atividades lúdicas e ensino cristão adaptado.\n\n*Requisitos para voluntários:*\n• Amor por crianças\n• Paciência e criatividade\n• Check-up de segurança\n\n*Horários:*\nDomingos: 9h00-12h00\nAtividades: Sábados 10h00`,
        contato: "+258844567890",
      },
      Social: {
        info: `🤝 *MINISTÉRIO DE AÇÃO SOCIAL*\n\n*Responsável:* Irmão Carlos Nhaca\n📞 +258 84 567 8901\n✉️ social@cfcpush.org\n\n*Descrição:*\nAções sociais na comunidade: distribuição de alimentos, visitas a hospitais, apoio a famílias carentes e projetos de desenvolvimento.\n\n*Requisitos:*\n• Compaixão e serviço\n• Disponibilidade para visitas\n• Trabalho em equipe\n\n*Horários:*\nReuniões: Terças 17h00\nAções: Sábados 8h00-12h00`,
        contato: "+258845678901",
      },
    };

    // Se o usuário já selecionou um ministério
    if (message && ministerios[message]) {
      await UserStateService.resetToMainMenu(phone);
      return {
        text: `${ministerios[message].info}\n\n📍 *Como Participar:*\nEntre em contato com o responsável ou compareça a uma reunião para conhecer o ministério!\n\nDigite [#] para menu principal.`,
      };
    }

    // Mostrar opções com botões
    const buttons = [
      { id: "Louvor e Adoração", text: "🎵 Louvor" },
      { id: "Intercessão", text: "🙏 Intercessão" },
      { id: "CFC Youth", text: "🔥 Juventude" },
      { id: "CFC Kids", text: "👶 Infantil" },
      { id: "Social", text: "🤝 Social" },
      { id: "#", text: "🏠 Menu Principal" },
    ];

    return {
      text: `🎵 *MINISTÉRIOS CFC PUSH*\n\n*Clique no ministério de seu interesse:*\n\nEnvolva-se no serviço à Deus e à comunidade! Cada ministério tem seu propósito único.`,
      buttons: buttons,
    };
  }

  // 🎯 ORAÇÃO - TIPO COM BOTÕES
  private async handleOracaoTipo(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const tiposOracao: { [key: string]: string } = {
      Saúde: "saude",
      Família: "familia",
      Finanças: "financas",
      Outros: "outros",
    };

    // Se o usuário já selecionou um tipo
    if (message && tiposOracao[message]) {
      await UserStateService.updateData(phone, {
        prayerType: tiposOracao[message],
      });

      if (message === "Família") {
        await UserStateService.setState(phone, "ORACAO_NOME_FAMILIA");
        return {
          text: `✅ *Oração pela Família* selecionada!\n\n*Digite o nome do membro da família* pelo qual deseja oração:\n(ex: Meu filho João, Minha esposa Maria, etc.)`,
        };
      } else {
        await UserStateService.setState(phone, "ORACAO_DETALHE");
        return {
          text: `✅ *${message}* selecionado!\n\n*Agora descreva seu pedido de oração:*\n\nPor favor, escreva detalhadamente sua necessidade:`,
        };
      }
    }

    // Mostrar opções com botões
    const buttons = [
      { id: "Saúde", text: "❤️ Saúde" },
      { id: "Família", text: "👨‍👩‍👧‍👦 Família" },
      { id: "Finanças", text: "💰 Finanças" },
      { id: "Outros", text: "📝 Outros" },
      { id: "#", text: "🏠 Menu Principal" },
    ];

    return {
      text: `🙏 *PEDIDO DE ORAÇÃO*\n\n*Para qual área você precisa de oração?*\n\nClique no tipo correspondente:\n\nNossa equipe de intercessão está pronta para orar por você!`,
      buttons: buttons,
    };
  }

  // 🎯 ASSISTÊNCIA - TIPO COM BOTÕES
  private async handleAssistenciaTipo(
    message: string,
    phone: string
  ): Promise<{ text: string; buttons?: any[] }> {
    const tiposAssistencia: { [key: string]: string } = {
      Alimentar: "assistencia_alimentar",
      Médica: "assistencia_medica",
      Jurídica: "assistencia_juridica",
      Outra: "assistencia_outra",
    };

    // Se o usuário já selecionou um tipo
    if (message && tiposAssistencia[message]) {
      await UserStateService.updateData(phone, {
        assistanceType: tiposAssistencia[message],
      });
      await UserStateService.setState(phone, "ASSISTENCIA_DETALHE");

      return {
        text: `✅ *Assistência ${message}* selecionada!\n\n*Descreva sua necessidade:*\n\nPor favor, forneça detalhes sobre sua situação para podermos ajudá-lo da melhor forma:`,
      };
    }

    // Mostrar opções com botões
    const buttons = [
      { id: "Alimentar", text: "🛒 Alimentar" },
      { id: "Médica", text: "🏥 Médica" },
      { id: "Jurídica", text: "⚖️ Jurídica" },
      { id: "Outra", text: "📝 Outra" },
      { id: "#", text: "🏠 Menu Principal" },
    ];

    return {
      text: `🤝 *ASSISTÊNCIA SOCIAL CFC PUSH*\n\n*Que tipo de assistência você precisa?*\n\nClique na opção correspondente:\n\nEstamos aqui para ajudar você e sua família!`,
      buttons: buttons,
    };
  }

  // 🎯 CADASTRO - NOME
  private async handleCadastroNome(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Nome vazio. Digite seu nome completo:";
    }

    const validation = this.isValidName(message);
    if (!validation.isValid) {
      return `${validation.error}\n\n*Digite seu nome completo novamente:*`;
    }

    await UserStateService.updateData(phone, { name: message.trim() });
    await UserStateService.setState(phone, "CADASTRO_DATA_NASCIMENTO");
    return `✅ Nome válido: *${message.trim()}*\n\nAgora digite sua *data de nascimento*:\n(ex: 15/08/1990)`;
  }

  // 🎯 CADASTRO - DATA NASCIMENTO
  private async handleCadastroDataNascimento(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Data vazia. Digite sua data de nascimento:";
    }

    const validation = this.isValidDate(message);
    if (!validation.isValid) {
      return `${validation.error}\n\n*Digite sua data de nascimento novamente:*`;
    }

    await UserStateService.updateData(phone, { dateOfBirth: message });
    await UserStateService.setState(phone, "CADASTRO_ESTADO_CIVIL");
    return `✅ Data válida!\n\nQual seu *estado civil*?\n\n[1] Solteiro(a)\n[2] Casado(a)\n[3] Divorciado(a)\n[4] Viúvo(a)\n[5] União de Facto`;
  }

  // 🎯 CADASTRO - ESTADO CIVIL
  private async handleCadastroEstadoCivil(
    message: string,
    phone: string
  ): Promise<string> {
    const estados: { [key: string]: string } = {
      "1": "Solteiro(a)",
      "2": "Casado(a)",
      "3": "Divorciado(a)",
      "4": "Viúvo(a)",
      "5": "União de Facto",
    };

    if (estados[message]) {
      await UserStateService.updateData(phone, {
        maritalStatus: estados[message],
      });
      await UserStateService.setState(phone, "CADASTRO_ENDERECO");
      return `✅ Estado civil registado: *${estados[message]}*\n\nAgora digite seu *endereço completo*:\n(ex: Av. Principal, 123 - Bairro, Cidade)`;
    } else {
      return "❌ Opção inválida. Digite o número do estado civil:\n[1] Solteiro(a)\n[2] Casado(a)\n[3] Divorciado(a)\n[4] Viúvo(a)\n[5] União de Facto";
    }
  }

  // 🎯 CADASTRO - ENDEREÇO
  private async handleCadastroEndereco(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message) || message.trim().length < 10) {
      return "❌ Endereço muito curto. Digite um endereço completo (mín. 10 caracteres):\n(ex: Av. 25 de Setembro, 1234 - Maputo)";
    }

    await UserStateService.updateData(phone, { address: message.trim() });
    await UserStateService.setState(phone, "CADASTRO_PROFISSAO");
    return `✅ Endereço registado!\n\nQual sua *profissão* ou *ocupação*?`;
  }

  // 🎯 CADASTRO - PROFISSÃO
  private async handleCadastroProfissao(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Profissão vazia. Digite sua profissão:";
    }

    await UserStateService.updateData(phone, { profession: message.trim() });
    await UserStateService.setState(phone, "CADASTRO_COMO_CONHECEU");
    return `✅ Profissão registada: *${message.trim()}*\n\n*Como conheceu a CFC PUSH?*\n\n[1] Amigo/Familiar\n[2] Rede Social\n[3] Visita/Evento\n[4] Propaganda\n[5] Outro`;
  }

  // 🎯 CADASTRO - COMO CONHECEU
  private async handleCadastroComoConheceu(
    message: string,
    phone: string
  ): Promise<string> {
    const opcoes: { [key: string]: string } = {
      "1": "Amigo/Familiar",
      "2": "Rede Social",
      "3": "Visita/Evento",
      "4": "Propaganda",
      "5": "Outro",
    };

    if (opcoes[message]) {
      const session = await UserStateService.getState(phone);
      const userData = session?.data || {};

      // ✅ SALVAR CADASTRO COMPLETO
      try {
        await UserStateService.saveUser(phone, {
          name: userData.name,
          dateOfBirth: userData.dateOfBirth
            ? new Date(userData.dateOfBirth.split("/").reverse().join("-"))
            : undefined,
          maritalStatus: userData.maritalStatus,
          address: userData.address,
          profession: userData.profession,
          howFoundChurch: opcoes[message],
          phone: this.formatPhoneNumber(phone),
          registrationDate: new Date(),
          isMember: true,
          lastInteraction: new Date(),
        });

        logger.info(`✅ Novo membro cadastrado: ${userData.name} (${phone})`);
      } catch (error) {
        logger.error("❌ Erro ao salvar cadastro:", error);
      }

      await UserStateService.resetToMainMenu(phone);

      return `🎉 *CADASTRO CONCLUÍDO!*\n\n*Irmão(ã) ${userData.name}*, seu cadastro foi realizado com sucesso!\n\n*Dados registados:*\n• Nome: ${userData.name}\n• Data Nasc.: ${userData.dateOfBirth}\n• Estado Civil: ${userData.maritalStatus}\n• Profissão: ${userData.profession}\n• Como conheceu: ${opcoes[message]}\n\n📞 Nossa equipe entrará em contato para boas-vindas e integração!\n\n*Bem-vindo(a) à família CFC PUSH!* 🙏\n\nDigite [#] para menu principal.`;
    } else {
      return "❌ Opção inválida. Digite como conheceu a igreja:\n[1] Amigo/Familiar\n[2] Rede Social\n[3] Visita/Evento\n[4] Propaganda\n[5] Outro";
    }
  }

  // 🎯 ORAÇÃO - NOME DA FAMÍLIA
  private async handleOracaoNomeFamilia(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Nome vazio. Digite o nome do membro da família:";
    }

    await UserStateService.updateData(phone, {
      prayerFamilyName: message.trim(),
    });
    await UserStateService.setState(phone, "ORACAO_DETALHE");
    return `✅ Nome registado: *${message.trim()}*\n\n*Agora descreva o pedido de oração para ${message.trim()}:*`;
  }

  // 🎯 ORAÇÃO - DETALHE
  private async handleOracaoDetalhe(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message) || message.trim().length < 5) {
      return "❌ Pedido muito curto. Descreva melhor sua necessidade (mín. 5 caracteres):";
    }

    await UserStateService.updateData(phone, { prayerDetail: message.trim() });
    await UserStateService.setState(phone, "ORACAO_ANONIMATO");

    return `✅ Pedido registado!\n\n*Deseja permanecer anónimo?*\n\n[1] Sim - Seu nome não será compartilhado\n[2] Não - Podemos usar seu nome no pedido\n\nEscolha uma opção:`;
  }

  // 🎯 ORAÇÃO - ANONIMATO
  private async handleOracaoAnonimato(
    message: string,
    phone: string
  ): Promise<string> {
    const session = await UserStateService.getState(phone);
    const userData = session?.data || {};

    let userName = "Anónimo";
    let isAnonymous = true;

    if (message === "2") {
      try {
        const user = await UserStateService.getUser(phone);
        userName = user?.name || "Irmão/Irmã";
        isAnonymous = false;
      } catch (error) {
        logger.error("❌ Erro ao buscar usuário:", error);
      }
    }

    // ✅ SALVAR PEDIDO DE ORAÇÃO
    try {
      await UserStateService.savePrayerRequest({
        userPhone: this.formatPhoneNumber(phone),
        userName: isAnonymous ? "Anónimo" : userName,
        description: userData.prayerDetail || "",
        type: (userData.prayerType as any) || "outros",
        familyMemberName: userData.prayerFamilyName,
        status: "pendente",
        isAnonymous: isAnonymous,
        prayerCount: 0,
        createdAt: new Date(),
      });

      logger.info(
        `🙏 Pedido de oração salvo: ${userName} - ${userData.prayerType}`
      );
    } catch (error) {
      logger.error("❌ Erro ao salvar pedido:", error);
      return "❌ Erro ao processar seu pedido. Tente novamente.";
    }

    await UserStateService.resetToMainMenu(phone);

    return `✅ *PEDIDO DE ORAÇÃO ENVIADO!*\n\n*Irmão(ã) ${userName}*, nosso time de intercessão já está orando por você!\n\n*Detalhes do pedido:*\n• Tipo: ${
      userData.prayerType
    }\n${
      userData.prayerFamilyName ? `• Para: ${userData.prayerFamilyName}\n` : ""
    }• Seu pedido: "${
      userData.prayerDetail
    }"\n\n🙏 *Deus te abençoe e guarde!*\n\nVocê receberá atualizações sobre seu pedido.\n\nDigite [#] para menu principal.`;
  }

  // 🎯 ASSISTÊNCIA - DETALHE
  private async handleAssistenciaDetalhe(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message) || message.trim().length < 10) {
      return "❌ Descrição muito curta. Descreva melhor sua necessidade (mín. 10 caracteres):";
    }

    const session = await UserStateService.getState(phone);
    const userData = session?.data || {};

    // ✅ SALVAR SOLICITAÇÃO DE ASSISTÊNCIA
    try {
      let userName = "Anónimo";
      try {
        const user = await UserStateService.getUser(phone);
        userName = user?.name || "Irmão/Irmã";
      } catch (error) {
        logger.error("❌ Erro ao buscar usuário:", error);
      }

      logger.info(
        `🤝 Assistência solicitada: ${userName} - ${userData.assistanceType} - ${message}`
      );
    } catch (error) {
      logger.error("❌ Erro ao salvar assistência:", error);
    }

    await UserStateService.resetToMainMenu(phone);

    return `✅ *SOLICITAÇÃO DE ASSISTÊNCIA ENVIADA!*\n\n*Tipo:* ${userData.assistanceType}\n*Descrição:* ${message}\n\n📞 Nossa equipe social entrará em contato em até 48 horas para avaliar sua situação e fornecer o apoio necessário.\n\n*CFC PUSH - Servindo com Amor!* ❤️\n\nDigite [#] para menu principal.`;
  }

  // 🎯 VISITA - DATA
  private async handleVisitaData(
    message: string,
    phone: string
  ): Promise<string> {
    const validation = this.isValidFutureDate(message);
    if (!validation.isValid) {
      return `${validation.error}\n\n*Digite a data novamente:* (ex: 25/12/2024)`;
    }

    await UserStateService.updateData(phone, { visitDate: message });
    await UserStateService.setState(phone, "VISITA_MOTIVO");
    return `✅ Data válida: *${message}*\n\nQual o *motivo da visita pastoral*?`;
  }

  // 🎯 VISITA - MOTIVO
  private async handleVisitaMotivo(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message) || message.trim().length < 5) {
      return "❌ Motivo muito curto. Descreva melhor o motivo (mín. 5 caracteres):";
    }

    const session = await UserStateService.getState(phone);
    const visitDate = session?.data?.visitDate;

    // ✅ SALVAR SOLICITAÇÃO DE VISITA
    try {
      let userName = "A confirmar";
      try {
        const user = await UserStateService.getUser(phone);
        userName = user?.name || "Irmão/Irmã";
      } catch (error) {
        logger.error("❌ Erro ao buscar usuário:", error);
      }

      logger.info(
        `🏠 Visita solicitada: ${userName} - ${visitDate} - ${message}`
      );
    } catch (error) {
      logger.error("❌ Erro ao salvar visita:", error);
    }

    await UserStateService.resetToMainMenu(phone);

    return `✅ *VISITA PASTORAL SOLICITADA!*\n\n*Data preferida:* ${visitDate}\n*Motivo:* ${message}\n\n📞 Nossa equipe pastoral entrará em contato em até 24 horas para confirmar a visita e combinar os detalhes.\n\n*Deus abençoe seu lar!* 🏠✨\n\nDigite [#] para menu principal.`;
  }

  // 🎯 TRANSFERÊNCIA - IGREJA ORIGEM
  private async handleTransferenciaIgrejaOrigem(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Nome vazio. Digite o nome da sua igreja de origem:";
    }

    await UserStateService.updateData(phone, {
      previousChurch: message.trim(),
    });
    await UserStateService.setState(phone, "TRANSFERENCIA_MOTIVO");
    return `✅ Igreja de origem registada: *${message.trim()}*\n\nQual o *motivo da transferência*?`;
  }

  // 🎯 TRANSFERÊNCIA - MOTIVO
  private async handleTransferenciaMotivo(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Motivo vazio. Digite o motivo da transferência:";
    }

    const session = await UserStateService.getState(phone);
    const userData = session?.data || {};

    // ✅ PROCESSAR TRANSFERÊNCIA
    try {
      let userName = "A confirmar";
      try {
        const user = await UserStateService.getUser(phone);
        userName = user?.name || "Irmão/Irmã";
      } catch (error) {
        logger.error("❌ Erro ao buscar usuário:", error);
      }

      logger.info(
        `🔄 Transferência solicitada: ${userName} - ${userData.previousChurch} - ${message}`
      );
    } catch (error) {
      logger.error("❌ Erro ao processar transferência:", error);
    }

    await UserStateService.resetToMainMenu(phone);

    return `✅ *SOLICITAÇÃO DE TRANSFERÊNCIA ENVIADA!*\n\n*Igreja de origem:* ${userData.previousChurch}\n*Motivo:* ${message}\n\n📞 Nossa equipe entrará em contato para completar o processo de transferência e integração.\n\n*Bem-vindo(a) à família CFC PUSH!* 🙏\n\nDigite [#] para menu principal.`;
  }

  // 🎯 ATUALIZAÇÃO DADOS - TIPO
  private async handleAtualizacaoDadosTipo(
    message: string,
    phone: string
  ): Promise<string> {
    const opcoes: { [key: string]: string } = {
      "1": "name",
      "2": "address",
      "3": "phone",
      "4": "profession",
      "5": "maritalStatus",
    };

    if (opcoes[message]) {
      await UserStateService.updateData(phone, {
        updateField: opcoes[message],
      });
      await UserStateService.setState(phone, "ATUALIZACAO_DADOS_NOVO_VALOR");
      const fieldNames: { [key: string]: string } = {
        name: "Nome",
        address: "Endereço",
        phone: "Telefone",
        profession: "Profissão",
        maritalStatus: "Estado Civil",
      };
      return `✅ Campo selecionado: *${
        fieldNames[opcoes[message]]
      }*\n\nDigite o *novo valor* para ${fieldNames[
        opcoes[message]
      ].toLowerCase()}:`;
    } else {
      return "❌ Opção inválida. Digite o campo que deseja atualizar:\n[1] Nome\n[2] Endereço\n[3] Telefone\n[4] Profissão\n[5] Estado Civil";
    }
  }

  // 🎯 ATUALIZAÇÃO DADOS - NOVO VALOR
  private async handleAtualizacaoDadosNovoValor(
    message: string,
    phone: string
  ): Promise<string> {
    if (!this.isValidMessage(message)) {
      return "❌ Valor vazio. Digite o novo valor:";
    }

    const session = await UserStateService.getState(phone);
    const userData = session?.data || {};

    // ✅ ATUALIZAR DADOS
    try {
      const user = await UserStateService.getUser(phone);
      if (user) {
        const updateData: any = {};
        updateData[userData.updateField || "name"] = message.trim();
        updateData.lastInteraction = new Date();

        await UserStateService.saveUser(phone, updateData);
        logger.info(
          `✏️ Dados atualizados: ${phone} - ${userData.updateField}: ${message}`
        );
      }
    } catch (error) {
      logger.error("❌ Erro ao atualizar dados:", error);
    }

    await UserStateService.resetToMainMenu(phone);

    const fieldNames: { [key: string]: string } = {
      name: "Nome",
      address: "Endereço",
      phone: "Telefone",
      profession: "Profissão",
      maritalStatus: "Estado Civil",
    };

    return `✅ *DADOS ATUALIZADOS COM SUCESSO!*\n\n*Campo:* ${
      fieldNames[userData.updateField || "name"]
    }\n*Novo valor:* ${message}\n\nSeus dados foram atualizados em nosso sistema.\n\nDigite [#] para menu principal.`;
  }

  // 🎯 DIREITOS E DEVERES
  private async handleDireitosDeveres(
    message: string,
    phone: string
  ): Promise<string> {
    await UserStateService.resetToMainMenu(phone);

    return `📋 *DIREITOS E DEVERES DOS MEMBROS*\n\n*DIREITOS:*\n• Participar dos cultos e atividades\n• Votar em assembleias\n• Receber visita pastoral\n• Usufruir dos benefícios espirituais\n• Participar dos ministérios\n• Receber aconselhamento pastoral\n\n*DEVERES:*\n• Frequência aos cultos\n• Contribuição financeira\n• Participação ativa\n• Testemunho cristão\n• Respeito à liderança\n• Compromisso com a doutrina\n\n*CFC PUSH - Uma família em Cristo!* 🙏\n\nDigite [#] para menu principal.`;
  }

  // ✅ VALIDAÇÃO DE MENSAGEM
  private isValidMessage(message: string): boolean {
    if (!message || typeof message !== "string") return false;
    const cleanMessage = message.trim();
    return cleanMessage.length > 0 && cleanMessage.length <= 500;
  }

  // ✅ VALIDAÇÃO DE OPÇÃO NUMÉRICA (ATUALIZADO PARA 15)
  private isValidMenuOption(
    option: string,
    min: number = 1,
    max: number = 15
  ): boolean {
    const num = parseInt(option, 10);
    return !isNaN(num) && num >= min && num <= max;
  }

  // ✅ VALIDAÇÃO DE NOME
  private isValidName(name: string): { isValid: boolean; error?: string } {
    if (!this.isValidMessage(name)) {
      return { isValid: false, error: "❌ Nome vazio ou inválido." };
    }

    const cleanName = name.trim();

    if (cleanName.length < 4) {
      return { isValid: false, error: "❌ Nome muito curto. Mínimo 4 letras." };
    }

    const nameRegex = /^[A-Za-zÀ-ÿ\s']+$/;
    if (!nameRegex.test(cleanName)) {
      return {
        isValid: false,
        error: "❌ Use apenas letras, espaços e apóstrofos.",
      };
    }

    const words = cleanName.split(/\s+/).filter((word) => word.length > 0);
    if (words.length < 2) {
      return { isValid: false, error: "❌ Digite nome e sobrenome completos." };
    }

    return { isValid: true };
  }

  // ✅ VALIDAÇÃO DE DATA
  private isValidDate(dateStr: string): { isValid: boolean; error?: string } {
    if (!this.isValidMessage(dateStr)) {
      return { isValid: false, error: "❌ Data vazia ou inválida." };
    }

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(dateRegex);

    if (!match) {
      return { isValid: false, error: "❌ Use DD/MM/AAAA (ex: 15/08/1990)" };
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12)
      return { isValid: false, error: "❌ Mês inválido (01-12)." };
    if (day < 1 || day > 31)
      return { isValid: false, error: "❌ Dia inválido (01-31)." };
    if (year < 1900 || year > new Date().getFullYear()) {
      return { isValid: false, error: "❌ Ano inválido (1900-ano atual)." };
    }

    const date = new Date(year, month - 1, day);
    if (
      date.getDate() !== day ||
      date.getMonth() !== month - 1 ||
      date.getFullYear() !== year
    ) {
      return { isValid: false, error: "❌ Data inexistente." };
    }

    return { isValid: true };
  }

  // ✅ VALIDAÇÃO DE DATA FUTURA
  private isValidFutureDate(dateStr: string): {
    isValid: boolean;
    error?: string;
  } {
    const dateValidation = this.isValidDate(dateStr);
    if (!dateValidation.isValid) return dateValidation;

    const [day, month, year] = dateStr.split("/").map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { isValid: false, error: "❌ Data passada. Use uma data futura." };
    }

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (inputDate > maxDate) {
      return {
        isValid: false,
        error: "❌ Data muito distante (máx. 3 meses).",
      };
    }

    return { isValid: true };
  }

  // 🎯 FORMATAR MENU PRINCIPAL EM TEXTO
  private formatMainMenuText(): string {
    const menu = MenuManager.getMainMenu();
    let menuText = "📋 *MENU CFC PUSH*\n\n";

    menu.sections.forEach((section) => {
      menuText += `*${section.title}*\n`;
      section.rows.forEach((row) => {
        menuText += `${row.title}\n`;
      });
      menuText += "\n";
    });

    menuText += "💡 Digite o número da opção ou [#] para navegação";
    return menuText;
  }

  // ✅ FORMATAÇÃO DE TELEFONE
  private formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.startsWith("258")) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("55")) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("1")) {
      return `+${cleanPhone}`;
    } else {
      // Assume Moçambique se não tiver código
      return `+258${cleanPhone}`;
    }
  }
}

// ✅ CORREÇÃO CRÍTICA: Exportar a CLASSE para poder instanciar
export default ChatController;
