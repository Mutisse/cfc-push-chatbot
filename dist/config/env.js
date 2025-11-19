"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.validateConfig = validateConfig;
// src/config/env.ts
exports.config = {
    port: process.env.PORT || 10000,
    nodeEnv: process.env.NODE_ENV || 'development',
    // Twilio Config
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioWhatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER,
    // MongoDB
    mongodbUri: process.env.MONGODB_URI,
};
// ✅ VALIDAÇÃO DAS VARIÁVEIS (opcional, mas útil)
function validateConfig() {
    const required = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_WHATSAPP_NUMBER',
        'MONGODB_URI'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.warn('⚠️ Variáveis de ambiente faltando:', missing);
    }
    else {
        console.log('✅ Todas as variáveis necessárias estão configuradas');
    }
}
