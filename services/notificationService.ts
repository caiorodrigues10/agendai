export const notifyBarberBot = async (targetPhone: string, message: string): Promise<boolean> => {
  // Limpa o número de telefone (remove caracteres não numéricos)
  const cleanPhone = targetPhone.replace(/\D/g, '');
  
  // Se o número for curto, assume que falta o DDI 55 (Brasil)
  const finalPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

  const url = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  
  // Abre o WhatsApp em uma nova aba
  // Nota: Isso funciona melhor se acionado diretamente por um gesto do usuário.
  window.open(url, '_blank');
  
  return true;
};