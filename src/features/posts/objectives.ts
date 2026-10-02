export type PostType = 'haircut' | 'beard' | 'announcement';

export const OBJECTIVES = [
  { id: 'promote-service', label: 'Divulgar serviço', description: 'Destaque um serviço e seu preço', templateKey: 'servico-destaque', type: 'haircut' as PostType },
  { id: 'fill-slots', label: 'Preencher horários', description: 'Mostre que ainda há vagas', templateKey: 'agenda-aberta', type: 'announcement' as PostType },
  { id: 'show-result', label: 'Mostrar resultado', description: 'Antes e depois do cliente', templateKey: 'antes-depois', type: 'haircut' as PostType },
  { id: 'highlight-staff', label: 'Destacar profissional', description: 'Apresente sua equipe', templateKey: 'profissional-destaque', type: 'haircut' as PostType },
  { id: 'share-review', label: 'Compartilhar depoimento', description: 'Experiência de clientes', templateKey: 'depoimento', type: 'announcement' as PostType },
  { id: 'announce', label: 'Comunicar novidade', description: 'Aviso, promoção ou lançamento', templateKey: 'novidade', type: 'announcement' as PostType },
] as const;

export type ObjectiveId = (typeof OBJECTIVES)[number]['id'];
