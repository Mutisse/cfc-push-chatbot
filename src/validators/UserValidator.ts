export class UserValidator {
  static validateName(name: string): { isValid: boolean; error?: string } {
    const messageValidation = this.validateMessage(name);
    if (!messageValidation.isValid) {
      return { isValid: false, error: '❌ Nome vazio ou inválido.' };
    }

    const cleanName = name.trim();

    if (cleanName.length < 4) {
      return { isValid: false, error: '❌ Nome muito curto. Mínimo 4 letras.' };
    }

    const nameRegex = /^[A-Za-zÀ-ÿ\s']+$/;
    if (!nameRegex.test(cleanName)) {
      return { isValid: false, error: '❌ Use apenas letras, espaços e apóstrofos.' };
    }

    const words = cleanName.split(/\s+/).filter((word) => word.length > 0);
    if (words.length < 2) {
      return { isValid: false, error: '❌ Digite nome e sobrenome completos.' };
    }

    return { isValid: true };
  }

  static validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || typeof message !== 'string') return { isValid: false, error: 'Campo vazio' };
    
    const cleanMessage = message.trim();
    return cleanMessage.length > 0 && cleanMessage.length <= 500 
      ? { isValid: true } 
      : { isValid: false, error: 'Texto muito longo ou vazio' };
  }
}