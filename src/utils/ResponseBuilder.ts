export class ResponseBuilder {
  static buildTwiMLResponse(message: string): string {
    const escapedMessage = this.escapeXml(message);
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapedMessage}</Message>
</Response>`;
  }

  static buildEmptyResponse(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>`;
  }

  private static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case "'":
          return "&apos;";
        case '"':
          return "&quot;";
        default:
          return c;
      }
    });
  }

  static buildWelcomeMessage(): string {
    return `🏛️ *CFC PUSH - Igreja da Família Cristã*\n\nShalom! 👋 Agradecemos por entrar em contato connosco. Somos a Igreja da Família Cristã - CFC PUSH - *Onde Oramos Até Algo Acontecer!*\n\n*Para continuar, selecione uma das opções abaixo:*\n\n💡 *Navegação rápida:*\nDigite [#] para voltar ao menu principal`;
  }

  static buildMainMenuButtons() {
    return [
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
  }
}
