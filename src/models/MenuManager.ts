export interface MenuOption {
  id: string;
  title: string;
  description: string;
}

export interface MenuSection {
  title: string;
  rows: MenuOption[];
}

export class MenuManager {
  static getMainMenu(): { sections: MenuSection[] } {
    return {
      sections: [
        {
          title: "EU QUERO:",
          rows: [
            { id: "1", title: "1. 🎯 Cadastro Novo Membro", description: "Cadastre-se como membro" },
            { id: "2", title: "2. 🙏 Pedido de Oração", description: "Envie um pedido de oração" },
            { id: "3", title: "3. 👨‍💼 Falar com Pastor", description: "Converse com o pastor" },
            { id: "4", title: "4. ⏰ Cultos e Horários", description: "Horários dos cultos" },
            { id: "5", title: "5. 💝 Contribuições", description: "Saiba como contribuir" },
          ],
        },
        {
          title: "MAIS OPÇÕES:",
          rows: [
            { id: "6", title: "6. 🏠 Visita Pastoral", description: "Solicite uma visita" },
            { id: "7", title: "7. 🤝 Assistência Social", description: "Programas de assistência" },
            { id: "8", title: "8. 🔔 Rede de Núcleos", description: "Conecte-se com núcleos" },
            { id: "9", title: "9. 🎵 Ministérios", description: "Participe de ministérios" },
            { id: "10", title: "10. 🎯 Campanhas Evangelização", description: "Evangelização" },
            { id: "11", title: "11. 🤝 Servos", description: "Como servir na igreja" },
            { id: "12", title: "12. 🛍️ Central Store", description: "Loja da igreja" },
            { id: "13", title: "13. 📍 Localização", description: "Localização da igreja" },
            { id: "14", title: "14. 💰 PUSH Invest", description: "Investimentos" },
            { id: "15", title: "15. ❌ Encerrar", description: "Finalizar atendimento" },
          ],
        },
      ],
    };
  }

  static getPrayerTypes(): MenuSection[] {
    return [{
      title: "Tipos de Oração",
      rows: [
        { id: "Saúde", title: "❤️ Saúde", description: "Saúde física e emocional" },
        { id: "Família", title: "👨‍👩‍👧‍👦 Família", description: "Família e relacionamentos" },
        { id: "Finanças", title: "💰 Finanças", description: "Assuntos financeiros" },
        { id: "Outros", title: "📝 Outros", description: "Outros pedidos" },
      ],
    }];
  }

  static getMinistries(): MenuSection[] {
    return [{
      title: "Ministérios",
      rows: [
        { id: "Louvor e Adoração", title: "🎵 Louvor", description: "Música e adoração" },
        { id: "Intercessão", title: "🙏 Intercessão", description: "Oração pela igreja" },
        { id: "CFC Youth", title: "🔥 Juventude", description: "Jovens 15-30 anos" },
        { id: "CFC Kids", title: "👶 Infantil", description: "Crianças 3-12 anos" },
        { id: "Social", title: "🤝 Social", description: "Ações sociais" },
      ],
    }];
  }

  static getNucleusRegions(): MenuSection[] {
    return [{
      title: "Regiões",
      rows: [
        { id: "Zona Norte", title: "📍 Zona Norte", description: "Responsável: Irmão João" },
        { id: "Zona Sul", title: "📍 Zona Sul", description: "Responsável: Irmã Maria" },
        { id: "Zona Leste", title: "📍 Zona Leste", description: "Responsável: Irmão Pedro" },
        { id: "Zona Oeste", title: "📍 Zona Oeste", description: "Responsável: Irmã Ana" },
        { id: "Centro", title: "📍 Centro", description: "Responsável: Irmão Carlos" },
      ],
    }];
  }

  static getAssistanceTypes(): MenuSection[] {
    return [{
      title: "Tipos de Assistência",
      rows: [
        { id: "Alimentar", title: "🛒 Alimentar", description: "Assistência alimentar" },
        { id: "Médica", title: "🏥 Médica", description: "Assistência médica" },
        { id: "Jurídica", title: "⚖️ Jurídica", description: "Assistência jurídica" },
        { id: "Outra", title: "📝 Outra", description: "Outra assistência" },
      ],
    }];
  }
}