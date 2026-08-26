import { QueueItem, Service, AIInsight } from '../types';

// Mensagens de fila — tom acolhedor para qualquer público (salão / barbearia / unissex)
const QUEUE_MESSAGES = [
  'O salão está tranquilo agora. Ótimo momento para chegar e ser atendido(a) sem espera.', // 0
  'Movimento suave. Só um cliente sendo atendido — deve sair rápido.', // 1
  'Dois na fila. Dá tempo de escolher o serviço e já sentar na cadeira.', // 2
  'Três na espera. O ritmo está calmo; a espera tende a ser curta.', // 3
  'Quatro pessoas na frente. Entre na fila para garantir sua vez.', // 4
  'Há 5 pessoas na frente. A espera deve ser um pouco maior.', // 5
  'Seis clientes aguardando. O movimento está aquecendo.', // 6
  'Sete na fila. A equipe está a todo vapor — prepare um tempinho a mais.', // 7
  'Oito na espera. Hoje o salão está bombando! Se tiver pressa, considere agendar.', // 8
  'Nove pessoas na frente. Vale se organizar e acompanhar a fila pelo celular.', // 9
  'Dez clientes! A espera está longa, mas o atendimento vale a pena.', // 10
  'Onze na fila. Paciência ajuda — ou marque um horário para voltar com tranquilidade.', // 11
  'Doze pessoas. Casa cheia hoje.', // 12
  'Treze na espera. Se ainda não agendou, a fila pode demorar.', // 13
  'Quatorze na fila. A demanda está alta demais!', // 14
  'Quinze pessoas! O movimento não para de crescer.', // 15
  'Dezesseis na contagem. Se tiver o dia livre, pode vir; senão, melhor agendar.', // 16
  'Dezessete na fila. Movimento intenso hoje.', // 17
  'Dezoito pessoas esperando. Considere trazer água e carregador.', // 18
  'Dezenove na frente. O salão está lotado.', // 19
  'Vinte pessoas! A fila está bem longa.', // 20
  'Vinte e um na espera. Só venha se puder esperar com calma.', // 21
  'Vinte e dois clientes. A espera pode levar algumas horas.', // 22
  'Vinte e três. Equipe no limite do dia!', // 23
  'Vinte e quatro na fila. Recorde de movimento.', // 24
  'Vinte e cinco pessoas. Se vier agora, traga o carregador do celular.', // 25
  'Vinte e seis. Casa cheia de ponta a ponta.', // 26
  'Vinte e sete. Espera longa — a qualidade do atendimento segue.', // 27
  'Vinte e oito na fila. Avise em casa que pode demorar.', // 28
  'Vinte e nove na frente. O salão virou ponto de encontro hoje.', // 29
  'Trinta ou mais! Fila quilométrica. Só venha se tiver bastante paciência — ou agende.', // 30+
];

export const getQueueInsight = async (
  queue: QueueItem[],
  services: Service[]
): Promise<AIInsight> => {
  const activeQueue = queue.filter(q => q.status === 'waiting' || q.status === 'in_chair');
  const count = activeQueue.length;

  let totalMinutes = 0;

  activeQueue.forEach(item => {
    const service = services.find(s => s.id === item.serviceId);
    const avgTime = service ? service.avgTimeMinutes : 30;

    if (item.status === 'in_chair') {
      totalMinutes += Math.round(avgTime / 2);
    } else {
      totalMinutes += avgTime;
    }
  });

  const messageIndex = Math.min(count, QUEUE_MESSAGES.length - 1);
  const message = QUEUE_MESSAGES[messageIndex];

  let busyLevel: 'low' | 'medium' | 'high' = 'low';
  if (count > 2) busyLevel = 'medium';
  if (count > 6) busyLevel = 'high';

  return {
    estimatedWait: `${totalMinutes} min`,
    message: message,
    busyLevel: busyLevel,
  };
};
