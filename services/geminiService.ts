import { GoogleGenAI } from "@google/genai";
import { QueueItem, Service, AIInsight } from "../types";

const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

// Lista de mensagens fixas baseadas na quantidade de pessoas na fila (0 a 30+)
const QUEUE_MESSAGES = [
  "Salve, mestre! A cadeira tá vazia e a resenha tá no ponto, chega mais pra dar aquele tapa no visual agora mesmo.", // 0
  "Movimento suave. Só um cliente sendo atendido, é vapt-vupt!", // 1
  "Dois na fila. Dá tempo de escolher o corte e já sentar na cadeira.", // 2
  "Três na espera. O clima tá tranquilo, encosta aí que sai rápido.", // 3
  "Quatro guerreiros na frente. Já entra na fila pra não perder a vez.", // 4
  "Ei parceiro, vai demorar um pouco. Tem 5 na frente.", // 5
  "Seis clientes aguardando. A chapa tá esquentando, segura a ansiedade.", // 6
  "Sete na fila. A tesoura tá trabalhando sem parar, mas vai demorar.", // 7
  "Oito na espera. Hoje a barbearia tá bombando! Se tiver pressa, complica.", // 8
  "Nove pessoas na frente. Prepara o tempo livre e vem pra resenha.", // 9
  "Dez clientes! A espera tá longa, mas o corte vale a pena.", // 10
  "Onze na fila. Haja paciência e café, meu amigo. Vai demorar.", // 11
  "Doze pessoas. O negócio tá sério hoje! Casa cheia.", // 12
  "Treze na espera. Se não agendou, prepara pro chá de cadeira.", // 13
  "Quatorze na fila. A demanda tá alta demais, chefia!", // 14
  "Quinze pessoas! Hoje vamos até tarde, a fila não para de crescer.", // 15
  "Dezesseis na contagem. Tá com o dia livre? Então chega mais.", // 16
  "Dezessete na fila. O movimento tá insano hoje!", // 17
  "Dezoito cabeças esperando. Melhor trazer um lanche.", // 18
  "Dezenove na frente. É dia de jogo? A barbearia tá lotada.", // 19
  "Vinte pessoas! A fila tá dando volta no quarteirão.", // 20
  "Vinte e um na espera. Só os fortes sobrevivem a essa fila.", // 21
  "Vinte e dois clientes. Vai demorar algumas horas, parceiro.", // 22
  "Vinte e três. A máquina vai pifar de tanto trabalhar!", // 23
  "Vinte e quatro na fila. Hoje é recorde de movimento.", // 24
  "Vinte e cinco pessoas. Se vier agora, traz o carregador do celular.", // 25
  "Vinte e seis. Tá parecendo final de campeonato, casa cheia!", // 26
  "Vinte e sete. A espera é longa, mas a qualidade garante.", // 27
  "Vinte e oito na fila. Avisa em casa que vai chegar tarde.", // 28
  "Vinte e nove guerreiros. A barbearia virou ponto turístico hoje.", // 29
  "Trinta ou mais! A fila tá quilométrica. Só venha se tiver paciência de monge." // 30+
];

export const generateShopLogo = async (
  shopName: string, 
  palette: string = 'Dark background (hex #0a0a0a), Neon Cyan (hex #06b6d4) and White accents',
  extraInstructions: string = ''
): Promise<string | null> => {
  try {
    const prompt = `
      A professional, minimalist vector logo icon for a barber shop named "${shopName}".
      Style: Modern, sleek, flat design, high quality vector art.
      Colors: ${palette}.
      Elements: Abstract scissors, razor, or barber pole integrated geometrically.
      Additional Instructions: ${extraInstructions || 'Clean composition, suitable for an app icon'}.
      Composition: Centered, symmetric, high contrast.
      No realistic photos, only vector graphic style.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating logo:", error);
    return null;
  }
};

export const getQueueInsight = async (
  queue: QueueItem[], 
  services: Service[]
): Promise<AIInsight> => {
  // Filter only waiting or in_chair items
  const activeQueue = queue.filter(q => q.status === 'waiting' || q.status === 'in_chair');
  const count = activeQueue.length;

  // --- Calculate Time Deterministically ---
  let totalMinutes = 0;
  
  activeQueue.forEach(item => {
    const service = services.find(s => s.id === item.serviceId);
    const avgTime = service ? service.avgTimeMinutes : 30; // Default 30 min

    if (item.status === 'in_chair') {
      // Assume person in chair is halfway done on average
      totalMinutes += Math.round(avgTime / 2);
    } else {
      totalMinutes += avgTime;
    }
  });

  // --- Select Message ---
  // Use array index matching the count. If count > 30, use the last message.
  const messageIndex = Math.min(count, QUEUE_MESSAGES.length - 1);
  const message = QUEUE_MESSAGES[messageIndex];

  // --- Determine Busy Level ---
  let busyLevel: 'low' | 'medium' | 'high' = 'low';
  if (count > 2) busyLevel = 'medium';
  if (count > 6) busyLevel = 'high';

  // Return Instant Result (No AI Cost)
  return {
    estimatedWait: `${totalMinutes} min`,
    message: message,
    busyLevel: busyLevel
  };
};