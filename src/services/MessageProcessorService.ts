import { UserStateService } from "./UserStateService";
import { MenuManager } from "../models/MenuManager";
import { MessageValidator } from "../validators/MessageValidator";
import { UserValidator } from "../validators/UserValidator";
import { DateValidator } from "../validators/DateValidator";
import { logger } from "../config/logger";

export class MessageProcessorService {
  // 🎯 MÉTODOS PRINCIPAIS DE PROCESSAMENTO

  static async processWelcome(message: string, phone: string) {
    await UserStateService.setState(phone, "MAIN_MENU");

    return {
      text: `🏛️ *CFC PUSH - Igreja da Família Cristã*\n\nShalom! 👋 Agradecemos por entrar em contato connosco. Somos a Igreja da Família Cristã - CFC PUSH - *Onde Oramos Até Algo Acontecer!*\n\n*Para continuar, selecione uma das opções abaixo:*\n\n💡 *Navegação rápida:*\nDigite [#] para voltar ao menu principal`,
      buttons: [
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
      ],
    };
  }

  static async processMainMenu(message: string, phone: string) {
    const normalizedMessage = message.trim().toLowerCase();

    // Tratamento de saudações
    const greetings = [
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
    if (greetings.includes(normalizedMessage) || normalizedMessage === "#") {
      return await this.processWelcome("", phone);
    }

    // Opções principais
    if (MessageValidator.isValidMenuOption(normalizedMessage, 1, 15)) {
      return await this.handleMainMenuOption(normalizedMessage, phone);
    }

    // Mapeamento de texto para números
    const textToNumber: { [key: string]: string } = {
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

    if (textToNumber[normalizedMessage]) {
      return await this.handleMainMenuOption(
        textToNumber[normalizedMessage],
        phone
      );
    }

    return {
      text: '❌ Opção não reconhecida. Digite "#" para ver o menu principal.',
    };
  }

  // 🎯 HANDLERS PARA CADA OPÇÃO DO MENU PRINCIPAL

  private static async handleMainMenuOption(option: string, phone: string) {
    switch (option) {
      case "1":
        return await this.handleSerMembro(phone);
      case "2":
        return await this.handleOracaoTipo(phone);
      case "3":
        return { text: this.getPastorInfo() };
      case "4":
        return { text: this.getServiceTimes() };
      case "5":
        return { text: this.getContributionInfo() };
      case "6":
        await UserStateService.setState(phone, "VISITA_DATA");
        return {
          text: "🏠 *VISITA PASTORAL*\n\nQual a melhor *data* para visita? (ex: 25/12/2024)\n\n*Formato:* DD/MM/AAAA",
        };
      case "7":
        return await this.handleAssistenciaTipo(phone);
      case "8":
        return await this.handleNucleoRegiao(phone);
      case "9":
        return await this.handleMinisterioTipo(phone);
      case "10":
        return { text: this.getEvangelizationInfo() };
      case "11":
        return { text: this.getServantsInfo() };
      case "12":
        return { text: this.getStoreInfo() };
      case "13":
        return { text: this.getLocationInfo() };
      case "14":
        await UserStateService.setState(phone, "PUSH_INVEST_MENU");
        return await this.handlePushInvestMenu("", phone);
      case "15":
        await UserStateService.deleteState(phone);
        return {
          text: "👋 *ATENDIMENTO ENCERRADO!*\n\nObrigado por contactar a *CFC PUSH - Igreja da Família Cristã*! 🙏\n\nQue Deus te abençoe ricamente!\n\n*Shalom!* ✨",
        };
      default:
        return {
          text: '❌ Opção em desenvolvimento. Digite "#" para menu principal.',
        };
    }
  }

  // 🎯 SER MEMBRO - SUBMENU
  private static async handleSerMembro(phone: string) {
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

  // 🎯 ORAÇÃO - TIPO
  static async handleOracaoTipo(phone: string) {
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

  // 🎯 ASSISTÊNCIA - TIPO
  static async handleAssistenciaTipo(phone: string) {
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

  // 🎯 NÚCLEOS - REGIÃO
  static async handleNucleoRegiao(phone: string) {
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

  // 🎯 MINISTÉRIOS - TIPO
  static async handleMinisterioTipo(phone: string) {
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

  // 🎯 PUSH INVEST - MENU
  static async handlePushInvestMenu(message: string, phone: string) {
    const normalizedMessage = message.trim();

    if (normalizedMessage === "Voltar" || normalizedMessage === "#") {
      await UserStateService.setState(phone, "MAIN_MENU");
      return await this.processMainMenu("", phone);
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
          return { text: this.getPushInvestProjetos() };
        case "investir":
          return { text: this.getPushInvestInvestir() };
        case "contato":
          return { text: this.getPushInvestContato() };
      }
    }

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

  // 🎯 HANDLERS PARA FLUXOS ESPECÍFICOS

  static async handleCadastroNome(message: string, phone: string) {
    const validation = UserValidator.validateName(message);
    if (!validation.isValid) {
      return {
        text: `${validation.error}\n\n*Digite seu nome completo novamente:*`,
      };
    }

    await UserStateService.updateData(phone, { name: message.trim() });
    await UserStateService.setState(phone, "CADASTRO_DATA_NASCIMENTO");

    return {
      text: `✅ Nome válido: *${message.trim()}*\n\nAgora digite sua *data de nascimento*:\n(ex: 15/08/1990)`,
    };
  }

  static async handleCadastroDataNascimento(message: string, phone: string) {
    const validation = DateValidator.validateDate(message);
    if (!validation.isValid) {
      return {
        text: `${validation.error}\n\n*Digite sua data de nascimento novamente:*`,
      };
    }

    await UserStateService.updateData(phone, { dateOfBirth: message });
    await UserStateService.setState(phone, "CADASTRO_ESTADO_CIVIL");

    return {
      text: `✅ Data válida!\n\nQual seu *estado civil*?\n\n[1] Solteiro(a)\n[2] Casado(a)\n[3] Divorciado(a)\n[4] Viúvo(a)\n[5] União de Facto`,
    };
  }

  static async handleCadastroEstadoCivil(message: string, phone: string) {
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

      return {
        text: `✅ Estado civil registado: *${estados[message]}*\n\nAgora digite seu *endereço completo*:\n(ex: Av. Principal, 123 - Bairro, Cidade)`,
      };
    } else {
      return {
        text: "❌ Opção inválida. Digite o número do estado civil:\n[1] Solteiro(a)\n[2] Casado(a)\n[3] Divorciado(a)\n[4] Viúvo(a)\n[5] União de Facto",
      };
    }
  }

  static async handleCadastroEndereco(message: string, phone: string) {
    const validation = MessageValidator.validateMessage(message);
    if (!validation.isValid || message.trim().length < 10) {
      return {
        text: "❌ Endereço muito curto. Digite um endereço completo (mín. 10 caracteres):\n(ex: Av. 25 de Setembro, 1234 - Maputo)",
      };
    }

    await UserStateService.updateData(phone, { address: message.trim() });
    await UserStateService.setState(phone, "CADASTRO_PROFISSAO");

    return {
      text: `✅ Endereço registado!\n\nQual sua *profissão* ou *ocupação*?`,
    };
  }

  static async handleCadastroProfissao(message: string, phone: string) {
    const validation = MessageValidator.validateMessage(message);
    if (!validation.isValid) {
      return { text: "❌ Profissão vazia. Digite sua profissão:" };
    }

    await UserStateService.updateData(phone, { profession: message.trim() });
    await UserStateService.setState(phone, "CADASTRO_COMO_CONHECEU");

    return {
      text: `✅ Profissão registada: *${message.trim()}*\n\n*Como conheceu a CFC PUSH?*\n\n[1] Amigo/Familiar\n[2] Rede Social\n[3] Visita/Evento\n[4] Propaganda\n[5] Outro`,
    };
  }

  static async handleCadastroComoConheceu(message: string, phone: string) {
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

      // Salvar usuário
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
          phone: phone,
          registrationDate: new Date(),
          isMember: true,
          lastInteraction: new Date(),
        });

        logger.info(`✅ Novo membro cadastrado: ${userData.name} (${phone})`);
      } catch (error) {
        logger.error("❌ Erro ao salvar cadastro:", error);
      }

      await UserStateService.resetToMainMenu(phone);

      return {
        text: `🎉 *CADASTRO CONCLUÍDO!*\n\n*Irmão(ã) ${userData.name}*, seu cadastro foi realizado com sucesso!\n\n*Dados registados:*\n• Nome: ${userData.name}\n• Data Nasc.: ${userData.dateOfBirth}\n• Estado Civil: ${userData.maritalStatus}\n• Profissão: ${userData.profession}\n• Como conheceu: ${opcoes[message]}\n\n📞 Nossa equipe entrará em contato para boas-vindas e integração!\n\n*Bem-vindo(a) à família CFC PUSH!* 🙏\n\nDigite [#] para menu principal.`,
      };
    } else {
      return {
        text: "❌ Opção inválida. Digite como conheceu a igreja:\n[1] Amigo/Familiar\n[2] Rede Social\n[3] Visita/Evento\n[4] Propaganda\n[5] Outro",
      };
    }
  }

  static async handleOracaoDetalhe(message: string, phone: string) {
    const validation = MessageValidator.validateMessage(message);
    if (!validation.isValid || message.trim().length < 5) {
      return {
        text: "❌ Pedido muito curto. Descreva melhor sua necessidade (mín. 5 caracteres):",
      };
    }

    await UserStateService.updateData(phone, { prayerDetail: message.trim() });
    await UserStateService.setState(phone, "ORACAO_ANONIMATO");

    return {
      text: `✅ Pedido registado!\n\n*Deseja permanecer anónimo?*\n\n[1] Sim - Seu nome não será compartilhado\n[2] Não - Podemos usar seu nome no pedido\n\nEscolha uma opção:`,
    };
  }

  static async handleOracaoAnonimato(message: string, phone: string) {
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

    // Salvar pedido de oração
    try {
      await UserStateService.savePrayerRequest({
        userPhone: phone,
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
      return { text: "❌ Erro ao processar seu pedido. Tente novamente." };
    }

    await UserStateService.resetToMainMenu(phone);

    return {
      text: `✅ *PEDIDO DE ORAÇÃO ENVIADO!*\n\n*Irmão(ã) ${userName}*, nosso time de intercessão já está orando por você!\n\n*Detalhes do pedido:*\n• Tipo: ${
        userData.prayerType
      }\n${
        userData.prayerFamilyName
          ? `• Para: ${userData.prayerFamilyName}\n`
          : ""
      }• Seu pedido: "${
        userData.prayerDetail
      }"\n\n🙏 *Deus te abençoe e guarde!*\n\nVocê receberá atualizações sobre seu pedido.\n\nDigite [#] para menu principal.`,
    };
  }

  static async handleAssistenciaDetalhe(message: string, phone: string) {
    const validation = MessageValidator.validateMessage(message);
    if (!validation.isValid || message.trim().length < 10) {
      return {
        text: "❌ Descrição muito curta. Descreva melhor sua necessidade (mín. 10 caracteres):",
      };
    }

    const session = await UserStateService.getState(phone);
    const userData = session?.data || {};

    // Salvar assistência
    try {
      let userName = "Anónimo";
      try {
        const user = await UserStateService.getUser(phone);
        userName = user?.name || "Irmão/Irmã";
      } catch (error) {
        logger.error("❌ Erro ao buscar usuário:", error);
      }

      await UserStateService.saveAssistanceRequest({
        userPhone: phone,
        userName: userName,
        type: userData.assistanceType as any,
        description: message,
        status: "pendente",
        priority: "media",
      });

      logger.info(
        `🤝 Assistência solicitada: ${userName} - ${userData.assistanceType}`
      );
    } catch (error) {
      logger.error("❌ Erro ao salvar assistência:", error);
    }

    await UserStateService.resetToMainMenu(phone);

    return {
      text: `✅ *SOLICITAÇÃO DE ASSISTÊNCIA ENVIADA!*\n\n*Tipo:* ${userData.assistanceType}\n*Descrição:* ${message}\n\n📞 Nossa equipe social entrará em contato em até 48 horas para avaliar sua situação e fornecer o apoio necessário.\n\n*CFC PUSH - Servindo com Amor!* ❤️\n\nDigite [#] para menu principal.`,
    };
  }

  static async handleVisitaData(message: string, phone: string) {
    const validation = DateValidator.validateFutureDate(message);
    if (!validation.isValid) {
      return {
        text: `${validation.error}\n\n*Digite a data novamente:* (ex: 25/12/2024)`,
      };
    }

    await UserStateService.updateData(phone, { visitDate: message });
    await UserStateService.setState(phone, "VISITA_MOTIVO");

    return {
      text: `✅ Data válida: *${message}*\n\nQual o *motivo da visita pastoral*?`,
    };
  }

  static async handleVisitaMotivo(message: string, phone: string) {
    const validation = MessageValidator.validateMessage(message);
    if (!validation.isValid || message.trim().length < 5) {
      return {
        text: "❌ Motivo muito curto. Descreva melhor o motivo (mín. 5 caracteres):",
      };
    }

    const session = await UserStateService.getState(phone);
    const visitDate = session?.data?.visitDate;

    // Registrar visita
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

    return {
      text: `✅ *VISITA PASTORAL SOLICITADA!*\n\n*Data preferida:* ${visitDate}\n*Motivo:* ${message}\n\n📞 Nossa equipe pastoral entrará em contato em até 24 horas para confirmar a visita e combinar os detalhes.\n\n*Deus abençoe seu lar!* 🏠✨\n\nDigite [#] para menu principal.`,
    };
  }

  // 🎯 MÉTODOS AUXILIARES PARA RESPOSTAS FIXAS

  static getPastorInfo = () =>
    `👨‍💼 *FALAR COM PASTOR*\n\n*Contatos:*\n📞 Telefone: +258 84 123 4567\n✉️ E-mail: pastor@cfcpush.org\n\n*Horários:*\nSegunda a Sexta: 14h-18h\nSábado: 9h-12h\n\nDigite [#] para menu principal`;

  static getServiceTimes = () =>
    `⏰ *CULTOS E HORÁRIOS*\n\n*DOMINGO*\n8h30 - Culto Principal\n\n*QUARTA-FEIRA*\n18h00 - Oração e Estudo\n\n*SEXTA-FEIRA*\n18h00 - CFC PUSH Jovens\n\n*SÁBADO*\n16h00 - Escola Bíblica\n\nDigite [#] para menu principal`;

  static getContributionInfo = () =>
    `💝 *CONTRIBUIÇÕES*\n\n*Métodos:*\n🏦 Banco: BCI\nConta: 123456789012\n\n📱 M-Pesa: +258 84 500 6000\n\n💵 Coleta nos Cultos\n\nDigite [#] para menu principal`;

  static getEvangelizationInfo = () =>
    `🎯 *EVANGELIZAÇÃO*\n\n*Próximos Eventos:*\n\n🔹 Evangelismo de Rua\nSábado, 15h00 - Centro\n\n🔹 Visitação Hospitalar\nQuintas, 10h00 - Hospital\n\n📞 Contato: +258 84 700 8000\n\nDigite [#] para menu principal`;

  static getServantsInfo = () =>
    `🤝 *SERVIÇO E VOLUNTARIADO*\n\n*Áreas Disponíveis:*\n• Recepção e Acolhimento\n• Limpeza e Manutenção\n• Mídia e Tecnologia\n• Intercessão e Oração\n\n📞 Contato: +258 84 900 1000\n\nDigite [#] para menu principal`;

  static getStoreInfo = () =>
    `🛍️ *CENTRAL STORE*\n\n*Produtos:*\n📚 Bíblias e Livros\n🎵 CDs e DVDs\n👕 Camisetas CFC\n\n📞 Contato: +258 84 600 7000\n\nDigite [#] para menu principal`;

  static getLocationInfo = () =>
    `📍 *LOCALIZAÇÃO*\n\n*Endereço:*\n🏛️ CFC PUSH - Igreja da Família Cristã\nAv. 25 de Setembro, 1234\nMaputo, Moçambique\n\n📞 Contato: +258 84 300 4000\n\nDigite [#] para menu principal`;

  static getPushInvestProjetos = () =>
    `💰 *PUSH INVEST - PROJETOS*\n\n*Em Desenvolvimento* 🚧\n\nEstamos criando oportunidades de investimento que beneficiem nossa comunidade.\n\n*Áreas de Atuação Futura:*\n• Desenvolvimento imobiliário\n• Projetos comunitários\n• Investimentos sustentáveis\n\n📞 Contato: +258 84 500 6000\n\nDigite [#] para voltar ao menu principal.`;

  static getPushInvestInvestir = () =>
    `💰 *PUSH INVEST - COMO INVESTIR*\n\n*Informações em Desenvolvimento* 📈\n\nEstamos estruturando as melhores opções de investimento.\n\n💼 *Contato:*\n📞 +258 84 500 6000\n✉️ invest@cfcpush.org\n\nDigite [#] para voltar ao menu principal.`;

  static getPushInvestContato = () =>
    `💰 *PUSH INVEST - CONTATO*\n\n*Equipe Especializada* 👨‍💼\n\n*Coordenação:*\nIrmão João Investimentos\n\n📞 Telefone: +258 84 500 6000\n✉️ Email: invest@cfcpush.org\n\n*Horário:*\nSegunda a Sexta: 9h-17h\n\nDigite [#] para voltar ao menu principal.`;
}
