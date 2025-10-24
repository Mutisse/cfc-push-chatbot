// src/config/env.ts
import dotenv from "dotenv";

dotenv.config();

// ✅ DEBUG: Log das variáveis de ambiente (remova depois)
console.log("🔍 ENV VARIABLES:");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("WHATSAPP_TOKEN exists:", !!process.env.WHATSAPP_TOKEN);
console.log("WHATSAPP_PHONE_NUMBER_ID:", process.env.WHATSAPP_PHONE_NUMBER_ID);

export const config = {
  port: parseInt(process.env.PORT || "10000"),
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  
  database: {
    uri: process.env.MONGODB_URI || "",
  },
  
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    verifyToken: process.env.VERIFY_TOKEN || "cfc_push_2024",
  },
  
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
      "https://cfc-push-chatbot.onrender.com"
    ],
  },
};