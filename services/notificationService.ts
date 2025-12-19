import { BARBER_PHONE } from '../constants';

// Em um cenário real, isso seria uma chamada para uma API Backend (Node.js/Python)
// que integraria com Twilio, WPPConnect ou Evolution API.
export const notifyBarberBot = async (message: string): Promise<boolean> => {
  console.log(`[BOT MOCK] Enviando para ${BARBER_PHONE}:`, message);
  
  // Simulando delay de rede/processamento do bot
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
};