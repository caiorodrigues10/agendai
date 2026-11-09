export type PostType = 'haircut' | 'beard' | 'announcement';

export const OBJECTIVES = [
  { id: 'promote-service', label: 'Divulgar serviço', description: 'Destaque um serviço e seu preço', templateKey: 'servico-destaque', type: 'haircut' as PostType },
  { id: 'fill-slots', label: 'Preencher horários', description: 'Mostre que ainda há vagas', templateKey: 'agenda-aberta', type: 'announcement' as PostType },
  { id: 'show-result', label: 'Mostrar resultado', description: 'Antes e depois do cliente', templateKey: 'antes-depois', type: 'haircut' as PostType },
  { id: 'highlight-staff', label: 'Destacar profissional', description: 'Apresente sua equipe', templateKey: 'profissional-destaque', type: 'haircut' as PostType },
  { id: 'share-review', label: 'Compartilhar depoimento', description: 'Experiência de clientes', templateKey: 'depoimento', type: 'announcement' as PostType },
  { id: 'announce', label: 'Comunicar novidade', description: 'Aviso, promoção ou lançamento', templateKey: 'novidade', type: 'announcement' as PostType },
] as const;

export const LEGAL_OBJECTIVES = [
  { id: 'legal-office', label: 'Identidade do escritório', description: 'Apresente sua atuação, localidade e contatos', templateKey: 'advocacia-cartao', type: 'announcement' as PostType },
  { id: 'legal-areas', label: 'Mapa de atuação', description: 'Organize os assuntos atendidos pelo escritório', templateKey: 'advocacia-areas', type: 'announcement' as PostType },
  { id: 'legal-information', label: 'Pergunta e resposta', description: 'Responda uma dúvida de forma informativa', templateKey: 'advocacia-trabalhista', type: 'announcement' as PostType },
  { id: 'legal-checklist', label: 'Checklist de contratos', description: 'Organize os pontos de atenção na leitura', templateKey: 'advocacia-consumidor', type: 'announcement' as PostType },
  { id: 'legal-steps', label: 'Etapas de contratação', description: 'Explique o contato, o escopo e a proposta', templateKey: 'advocacia-familia', type: 'announcement' as PostType },
  { id: 'legal-documents', label: 'Guia de registros', description: 'Oriente a organização de documentos e mensagens', templateKey: 'advocacia-previdenciario', type: 'announcement' as PostType },
  { id: 'legal-guidance', label: 'Contato seguro', description: 'Ajude a confirmar pedidos por canais conhecidos', templateKey: 'advocacia-empresarial', type: 'announcement' as PostType },
  { id: 'legal-editorial', label: 'Pauta aberta', description: 'Receba sugestões de temas para novos conteúdos', templateKey: 'advocacia-contratos', type: 'announcement' as PostType },
  { id: 'legal-profile', label: 'Perfil profissional', description: 'Apresente quem atende e os canais disponíveis', templateKey: 'advocacia-perfil', type: 'announcement' as PostType },
  { id: 'legal-notice', label: 'Aviso com data', description: 'Comunique datas, horários e informações de atendimento', templateKey: 'advocacia-comunicado', type: 'announcement' as PostType },
] as const;

/** Informative next steps. Suggested only while the user has not customized the CTA. */
export const LEGAL_CTA_BY_TEMPLATE: Readonly<Record<string, string>> = {
  'advocacia-cartao': 'Conheça a atuação',
  'advocacia-areas': 'Tire sua dúvida',
  'advocacia-trabalhista': 'Salve para consultar',
  'advocacia-consumidor': 'Salve esta lista',
  'advocacia-familia': 'Converse com o escritório',
  'advocacia-previdenciario': 'Confira os documentos',
  'advocacia-empresarial': 'Compartilhe este cuidado',
  'advocacia-contratos': 'Envie uma sugestão',
  'advocacia-perfil': 'Fale com o profissional',
  'advocacia-comunicado': 'Confira a agenda',
};

export type ObjectiveId = (typeof LEGAL_OBJECTIVES)[number]['id'] | (typeof OBJECTIVES)[number]['id'] | `category-${string}`;

export interface CategoryPostObjective {
  id: `category-${string}`;
  label: string;
  description: string;
  templateKey: string;
  type: 'announcement';
}

/** The backend owns category names and template keys; no second segment registry lives in the editor. */
export function categoryPostObjectives(templates: readonly { key: string; name: string; description: string; businessCategory?: string }[]): CategoryPostObjective[] | null {
  const category = templates.find(template => template.businessCategory)?.businessCategory;
  if (!category || ['barbearia', 'salao', 'beleza', 'advocacia'].includes(category)) return null;
  return [1, 2, 4, 8, 9, 10].flatMap(number => {
    const template = templates.find(item => item.key === `${category}-colecao-${number}` && item.businessCategory === category);
    if (!template) return [];
    const separator = template.name.indexOf(' · ');
    return [{
      id: `category-${template.key}` as const,
      label: separator >= 0 ? template.name.slice(separator + 3) : template.name,
      description: template.description,
      templateKey: template.key,
      type: 'announcement' as const,
    }];
  });
}
