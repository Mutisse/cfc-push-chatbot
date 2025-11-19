export class Formatter {
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.startsWith("258")) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("55")) {
      return `+${cleanPhone}`;
    } else if (cleanPhone.startsWith("1")) {
      return `+${cleanPhone}`;
    } else {
      return `+258${cleanPhone}`;
    }
  }

  static escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  }
}