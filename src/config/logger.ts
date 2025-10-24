import winston from "winston";

// Formato personalizado para logs
// No formato de log, você pode ajustar as mensagens:
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// Configuração do logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
    // File transport para errors
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
    }),
    // File transport para todos os logs
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
    }),
  ],
});

// Stream para Morgan usar Winston
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
