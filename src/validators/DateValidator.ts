export class DateValidator {
  static validateDate(dateStr: string): { isValid: boolean; error?: string } {
    if (!dateStr || typeof dateStr !== 'string') {
      return { isValid: false, error: '❌ Data vazia ou inválida.' };
    }

    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(dateRegex);

    if (!match) {
      return { isValid: false, error: '❌ Use DD/MM/AAAA (ex: 15/08/1990)' };
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12) return { isValid: false, error: '❌ Mês inválido (01-12).' };
    if (day < 1 || day > 31) return { isValid: false, error: '❌ Dia inválido (01-31).' };
    if (year < 1900 || year > new Date().getFullYear()) {
      return { isValid: false, error: '❌ Ano inválido (1900-ano atual).' };
    }

    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return { isValid: false, error: '❌ Data inexistente.' };
    }

    return { isValid: true };
  }

  static validateFutureDate(dateStr: string): { isValid: boolean; error?: string } {
    const dateValidation = this.validateDate(dateStr);
    if (!dateValidation.isValid) return dateValidation;

    const [day, month, year] = dateStr.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { isValid: false, error: '❌ Data passada. Use uma data futura.' };
    }

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (inputDate > maxDate) {
      return { isValid: false, error: '❌ Data muito distante (máx. 3 meses).' };
    }

    return { isValid: true };
  }
}