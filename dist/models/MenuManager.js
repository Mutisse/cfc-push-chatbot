"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuManager = void 0;
class MenuManager {
    static getMainMenu() {
        return {
            sections: [
                {
                    title: "EU QUERO:",
                    rows: [
                        {
                            id: "1",
                            title: "1. 🎯 Cadastro Novo Membro",
                            description: "Cadastre-se como membro da igreja",
                        },
                        {
                            id: "2",
                            title: "2. 🙏 Pedido de Oração",
                            description: "Envie um pedido de oração",
                        },
                        {
                            id: "3",
                            title: "3. 👨‍💼 Falar com Pastor",
                            description: "Converse com o pastor sobre assuntos importantes",
                        },
                        {
                            id: "4",
                            title: "4. ⏰ Cultos e Horários",
                            description: "Obtenha informações sobre cultos e horários",
                        },
                        {
                            id: "5",
                            title: "5. 💝 Contribuições",
                            description: "Saiba como fazer suas contribuições",
                        },
                    ],
                },
                {
                    title: "MAIS OPÇÕES:",
                    rows: [
                        {
                            id: "6",
                            title: "6. 🏠 Visita Pastoral",
                            description: "Solicite uma visita ou aconselhamento",
                        },
                        {
                            id: "7",
                            title: "7. 🤝 Assistência Social",
                            description: "Conheça os programas de assistência social",
                        },
                        {
                            id: "8",
                            title: "8. 🔔 Rede de Núcleos",
                            description: "Conecte-se com núcleos da igreja",
                        },
                        {
                            id: "9",
                            title: "9. 🎵 Ministérios",
                            description: "Participe de um dos nossos Ministérios",
                        },
                        {
                            id: "10",
                            title: "10. 🎯 Campanhas Evangelização",
                            description: "Envolva-se nas campanhas de evangelização",
                        },
                        {
                            id: "11",
                            title: "11. 🤝 Servos",
                            description: "Descubra como servir na igreja",
                        },
                        {
                            id: "12",
                            title: "12. 🛍️ Central Store",
                            description: "Explore os produtos da loja central",
                        },
                        {
                            id: "13",
                            title: "13. 📍 Localização",
                            description: "Encontre a localização da igreja",
                        },
                        {
                            id: "14",
                            title: "14. ❌ Encerrar Atendimento",
                            description: "Finalize a sessão de atendimento",
                        },
                    ],
                },
            ],
        };
    }
    static getPrayerTypes() {
        return [
            {
                title: "Tipos de Oração",
                rows: [
                    {
                        id: "1",
                        title: "1. ❤️ Saúde",
                        description: "Pedidos relacionados à saúde física e emocional",
                    },
                    {
                        id: "2",
                        title: "2. 👨‍👩‍👧‍👦 Família",
                        description: "Orações pela família e relacionamentos",
                    },
                    {
                        id: "3",
                        title: "3. 💰 Finanças",
                        description: "Assuntos financeiros e provisão",
                    },
                    {
                        id: "4",
                        title: "4. 🔄 Outros",
                        description: "Outros pedidos de oração específicos",
                    },
                ],
            },
        ];
    }
    static getMinistries() {
        return [
            {
                title: "Ministérios Disponíveis",
                rows: [
                    {
                        id: "1",
                        title: "1. 🎵 Louvor e Adoração",
                        description: "Ministério de música, louvor e adoração",
                    },
                    {
                        id: "2",
                        title: "2. 🙏 Intercessão",
                        description: "Grupo de oração e intercessão pela igreja",
                    },
                    {
                        id: "3",
                        title: "3. 🔥 CFC Youth",
                        description: "Ministério jovem para idades 15-30 anos",
                    },
                    {
                        id: "4",
                        title: "4. 👶 CFC Kids",
                        description: "Ministério infantil para crianças 3-12 anos",
                    },
                    {
                        id: "5",
                        title: "5. 💑 Casais",
                        description: "Ministério para casais e famílias",
                    },
                    {
                        id: "6",
                        title: "6. 📢 Evangelização",
                        description: "Ministério de evangelismo e missões",
                    },
                    {
                        id: "7",
                        title: "7. 📡 Mídia e Comunicação",
                        description: "Ministério de mídia, tecnologia e comunicação",
                    },
                    {
                        id: "8",
                        title: "8. 🤝 Ação Social",
                        description: "Ministério de ações sociais e comunitárias",
                    },
                ],
            },
        ];
    }
    static getNucleusRegions() {
        return [
            {
                title: "Regiões dos Núcleos",
                rows: [
                    {
                        id: "norte",
                        title: "📍 Zona Norte",
                        description: "Núcleo Zona Norte - Responsável: Irmão João",
                    },
                    {
                        id: "sul",
                        title: "📍 Zona Sul",
                        description: "Núcleo Zona Sul - Responsável: Irmã Maria",
                    },
                    {
                        id: "leste",
                        title: "📍 Zona Leste",
                        description: "Núcleo Zona Leste - Responsável: Irmão Pedro",
                    },
                    {
                        id: "oeste",
                        title: "📍 Zona Oeste",
                        description: "Núcleo Zona Oeste - Responsável: Irmã Ana",
                    },
                    {
                        id: "centro",
                        title: "📍 Centro",
                        description: "Núcleo Centro - Responsável: Irmão Carlos",
                    },
                ],
            },
        ];
    }
    static getSocialAssistance() {
        return [
            {
                title: "Programas de Assistência",
                rows: [
                    {
                        id: "1",
                        title: "1. 🛒 Cesta Básica",
                        description: "Distribuição mensal de alimentos",
                    },
                    {
                        id: "2",
                        title: "2. 💬 Aconselhamento",
                        description: "Aconselhamento pastoral e psicológico",
                    },
                    {
                        id: "3",
                        title: "3. 👨‍👩‍👧‍👦 Apoio Familiar",
                        description: "Suporte integral para famílias",
                    },
                    {
                        id: "4",
                        title: "4. 🏥 Saúde",
                        description: "Orientação e encaminhamento em saúde",
                    },
                    {
                        id: "5",
                        title: "5. ⚖️ Jurídico",
                        description: "Orientação jurídica básica",
                    },
                ],
            },
        ];
    }
    static getContactPastor() {
        return [
            {
                title: "Formas de Contato",
                rows: [
                    {
                        id: "phone",
                        title: "📞 Telefone Direto",
                        description: "+258 84 123 4567",
                    },
                    {
                        id: "email",
                        title: "✉️ E-mail Pessoal",
                        description: "pastor@cfcpush.org",
                    },
                    {
                        id: "visit",
                        title: "🏠 Visita Pastoral",
                        description: "Agende uma visita pastoral em casa",
                    },
                    {
                        id: "office",
                        title: "🏛️ Gabinete",
                        description: "Segunda a Sexta, 14h-18h",
                    },
                ],
            },
        ];
    }
    static getServiceTimes() {
        return [
            {
                title: "Horários dos Cultos",
                rows: [
                    {
                        id: "domingo",
                        title: "📅 Domingo - Celebração",
                        description: "8h30 | Culto Principal de Celebração",
                    },
                    {
                        id: "quarta",
                        title: "📅 Quarta - Oração/Estudo",
                        description: "18h00 | Oração e Estudo Bíblico",
                    },
                    {
                        id: "sexta",
                        title: "📅 Sexta - Juventude",
                        description: "18h00 | CFC PUSH Jovens",
                    },
                    {
                        id: "sabado",
                        title: "📅 Sábado - Ensino",
                        description: "16h00 | Escola Bíblica e Discipulado",
                    },
                ],
            },
        ];
    }
    static getContributionMethods() {
        return [
            {
                title: "Métodos de Contribuição",
                rows: [
                    {
                        id: "bank",
                        title: "🏦 Transferência Bancária",
                        description: "Banco: BCI | Conta: 123456789012",
                    },
                    {
                        id: "mobile",
                        title: "📱 M-Pesa / Mobile Money",
                        description: "Número: +258 84 500 6000",
                    },
                    {
                        id: "cash",
                        title: "💵 Ofício de Coleta",
                        description: "Durante os cultos presenciais",
                    },
                    {
                        id: "online",
                        title: "🌐 Online (Breve)",
                        description: "Plataforma digital em desenvolvimento",
                    },
                ],
            },
        ];
    }
    // Método auxiliar para formatar qualquer menu em texto
    static formatMenuToText(menuSections) {
        let menuText = "";
        menuSections.forEach((section) => {
            menuText += `*${section.title}*\n`;
            section.rows.forEach((row) => {
                menuText += `${row.title}\n`;
            });
            menuText += "\n";
        });
        return menuText.trim();
    }
    // Método para buscar opção do menu por ID
    static findMenuOption(menuSections, optionId) {
        for (const section of menuSections) {
            const found = section.rows.find((row) => row.id === optionId);
            if (found)
                return found;
        }
        return undefined;
    }
    // Método para validar se uma opção existe no menu
    static isValidOption(menuSections, optionId) {
        return this.findMenuOption(menuSections, optionId) !== undefined;
    }
    // Método para obter todas as opções disponíveis
    static getAllOptions(menuSections) {
        const options = [];
        menuSections.forEach((section) => {
            section.rows.forEach((row) => {
                options.push(row.id);
            });
        });
        return options;
    }
}
exports.MenuManager = MenuManager;
