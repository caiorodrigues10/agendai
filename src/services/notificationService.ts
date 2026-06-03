export const notifyBarberBot = async (targetPhone: string, message: string): Promise<boolean> => {
  // Limpa o número de telefone (remove caracteres não numéricos)
  const cleanPhone = targetPhone.replace(/\D/g, '');

  // Se o número for curto, assume que falta o DDI 55 (Brasil)
  const finalPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;

  // Em um ambiente de produção real, isso seria uma chamada de API para o backend
  // enviar a mensagem via WhatsApp Business API ou Gateway (ex: Twilio, Z-API).
  // Exemplo: await apiClient.post('/api/notifications/whatsapp', { phone: finalPhone, message });

  console.log(`[SIMULAÇÃO BACKEND] Enviando WhatsApp para ${finalPhone}:`, message);

  // NÃO abrimos mais a janela do cliente. O envio é "silencioso" (server-side).
  return true;
};