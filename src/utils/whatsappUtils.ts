/** Dígitos do telefone (somente números). */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Link wa.me para contato direto (Brasil). */
export function buildWhatsAppUrl(phone: string): string | null {
  const d = digitsOnly(phone);
  if (d.length < 10) return null;
  const withCc = d.startsWith('55') ? d : `55${d.replace(/^0/, '')}`;
  return `https://wa.me/${withCc}`;
}
