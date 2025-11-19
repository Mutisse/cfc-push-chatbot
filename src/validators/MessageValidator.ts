export class MessageValidator {
  static validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
      return { isValid: false, error: 'Mensagem vazia ou inválida' };
    }

    const cleanMessage = message.trim();

    if (cleanMessage.length === 0) {
      return { isValid: false, error: 'Mensagem vazia' };
    }

    if (cleanMessage.length > 500) {
      return { isValid: false, error: 'Mensagem muito longa (máx. 500 caracteres)' };
    }

    return { isValid: true };
  }

  static validatePhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 9 && cleanPhone.length <= 15;
  }

  static isValidMenuOption(option: string, min: number = 1, max: number = 15): boolean {
    const num = parseInt(option, 10);
    return !isNaN(num) && num >= min && num <= max;
  }
}