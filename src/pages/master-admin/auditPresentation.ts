import type { AuditFacets } from '../../infra/adminAuditApi';

const MASK = '•••••';
const SENSITIVE_KEY =
  /password|senha|token|secret|authorization|apikey|cpf|cnpj|cardnumber|creditcard|cvv|cvc/i;
const SENSITIVE_TYPE =
  /^(cpf|cnpj|email|whatsapp|phone|telefone|password|senha|token|secret|card)$/i;
const normalize = (key: string): string => key.replace(/[^a-z0-9]/gi, '');
const isSensitiveKey = (key: string): boolean =>
  SENSITIVE_KEY.test(normalize(key)) || /^card$/i.test(key);

const maskDocumentText = (value: string): string =>
  value.replace(
    /\b(?:\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{11}|\d{14})\b/g,
    MASK
  );

const maskValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(maskValue);
  if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    const type = object.type ?? object.tipo;
    const sensitiveValue = typeof type === 'string' && SENSITIVE_TYPE.test(type);
    return Object.fromEntries(
      Object.entries(object).map(([key, child]) => [
        key,
        isSensitiveKey(key) || (sensitiveValue && /^(value|valor)$/i.test(key))
          ? MASK
          : maskValue(child),
      ])
    );
  }
  if (typeof value === 'string') {
    if (/^\s*[{[]/.test(value)) {
      try {
        return JSON.stringify(maskValue(JSON.parse(value)));
      } catch {
        /* Plain text. */
      }
    }
    return maskDocumentText(value);
  }
  return value;
};

/** The same redacted representation is used by the list, details and clipboard. */
export const maskSensitiveJson = (text: string | null): string => {
  if (!text) return 'Sem detalhes.';
  try {
    return JSON.stringify(maskValue(JSON.parse(text)), null, 2);
  } catch {
    const sensitiveProperty =
      /("(?:[^"\\]*(?:password|senha|token|secret|authorization|api[_-]?key|cpf|cnpj|card|cvv|cvc)[^"\\]*)"\s*:\s*)("(?:\\.|[^"\\])*"|[^,}\s]+)/gi;
    let result = text.replace(sensitiveProperty, `$1"${MASK}"`);
    if (
      /"(?:type|tipo)"\s*:\s*"(?:CPF|CNPJ|EMAIL|WHATSAPP|PHONE|TELEFONE|PASSWORD|TOKEN|SECRET|CARD)"/i.test(
        text
      )
    ) {
      result = result.replace(
        /("(?:value|valor)"\s*:\s*)("(?:\\.|[^"\\])*"|[^,}\s]+)/gi,
        `$1"${MASK}"`
      );
    }
    return maskDocumentText(result);
  }
};

const RESOURCE_LABELS: Record<string, string> = {
  products: 'Produtos',
  product: 'Produtos',
  users: 'Usuários',
  user: 'Usuários',
  auth: 'Acessos',
  queue: 'Fila',
  appointments: 'Agendamentos',
  appointment: 'Agendamentos',
  barbershops: 'Salões',
  barbershop: 'Salões',
  blockedentity: 'Bloqueios',
  blockedentities: 'Bloqueios',
  subscriptions: 'Assinaturas',
  subscription: 'Assinaturas',
  plans: 'Planos',
  payments: 'Pagamentos',
  payment: 'Pagamentos',
  services: 'Serviços',
  clients: 'Clientes',
  expenses: 'Despesas',
  cash: 'Caixa',
  fiado: 'Fiado',
  admin: 'Administração',
  auditlogs: 'Auditoria',
  feed: 'Publicações',
  posts: 'Publicações',
  organizations: 'Organizações',
  sessions: 'Sessões',
  support: 'Suporte',
};

export const auditResourceLabel = (resource: string): string =>
  RESOURCE_LABELS[normalize(resource).toLowerCase()] ?? resource;

export type AuditActionTone = 'neutral' | 'info' | 'warning' | 'danger';

export const describeAuditAction = (
  action: string,
  _resource: string
): { label: string; tone: AuditActionTone } => {
  const special: Record<string, { label: string; tone: AuditActionTone }> = {
    BLOCK_ENTITY: { label: 'Bloqueio registrado', tone: 'warning' },
    UNBLOCK_ENTITY: { label: 'Bloqueio removido', tone: 'info' },
    ACCOUNT_IMPERSONATE: { label: 'Acesso assistido iniciado', tone: 'warning' },
    ACCOUNT_BLOCK: { label: 'Conta bloqueada', tone: 'warning' },
    ACCOUNT_UNBLOCK: { label: 'Conta desbloqueada', tone: 'info' },
    ACCOUNT_DELETE: { label: 'Conta excluída', tone: 'danger' },
    ACCOUNT_SUSPEND: { label: 'Conta suspensa', tone: 'warning' },
    LOGIN: { label: 'Acesso realizado', tone: 'info' },
    LOGOUT: { label: 'Sessão encerrada', tone: 'neutral' },
  };
  if (special[action]) return special[action];
  if (/^POST\s+\/api\/auth\/login(?:\?|$)/i.test(action)) return special.LOGIN;
  if (/^POST\s+\/api\/auth\/logout(?:\?|$)/i.test(action)) return special.LOGOUT;
  if (/^POST\s+\/api\/queue(?:\?|$)/i.test(action))
    return { label: 'Entrada adicionada à fila', tone: 'info' };
  if (/^DELETE\b/i.test(action)) return { label: 'Registro excluído', tone: 'danger' };
  if (/^(PATCH|PUT)\b/i.test(action)) return { label: 'Registro atualizado', tone: 'info' };
  if (
    /^POST\s+\/api\/(products|users|services|appointments|clients|expenses|feed)(?:\?|$)/i.test(
      action
    )
  )
    return { label: 'Registro criado', tone: 'info' };
  if (/^POST\b/i.test(action)) return { label: 'Ação registrada', tone: 'info' };
  return { label: action.replace(/_/g, ' '), tone: 'neutral' };
};

export const auditActorLabel = (userId: string, users: AuditFacets['users'] = []): string => {
  if (/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(userId)) return 'Sistema';
  return users.find(user => user.id === userId)?.name ?? 'Usuário não identificado';
};

const FIELD_LABELS: Record<string, string> = {
  reason: 'Motivo',
  motivo: 'Motivo',
  message: 'Descrição',
  name: 'Nome',
  nome: 'Nome',
  type: 'Tipo',
  tipo: 'Tipo',
  value: 'Valor',
  valor: 'Valor',
  fields: 'Campos alterados',
  values: 'Valores registrados',
  status: 'Status',
  active: 'Ativo',
  title: 'Título',
  serviceId: 'Serviço',
  barbershopId: 'Salão',
  customerName: 'Cliente',
  sessionId: 'Sessão',
  whatsapp: 'WhatsApp',
  price: 'Preço',
  quantity: 'Quantidade',
  email: 'E-mail',
  role: 'Perfil',
  endDate: 'Fim da assinatura',
  startDate: 'Início da assinatura',
  before: 'Antes',
  after: 'Depois',
  previous: 'Valor anterior',
  next: 'Novo valor',
};

export const auditFieldLabel = (key: string): string =>
  FIELD_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');

export const auditDetailSummary = (details: string | null): string => {
  if (!details) return 'Nenhum detalhe adicional informado.';
  const safe = maskSensitiveJson(details);
  let summary = '';
  try {
    const data: unknown = JSON.parse(safe);
    if (typeof data === 'string') summary = data;
    else if (data && typeof data === 'object' && !Array.isArray(data)) {
      const record = data as Record<string, unknown>;
      const reason = record.reason ?? record.motivo ?? record.message;
      if (typeof reason === 'string' && reason.trim()) summary = reason;
      else if (Array.isArray(record.fields) && record.fields.length > 0) {
        summary = `Campos alterados: ${record.fields
          .filter((field): field is string => typeof field === 'string')
          .map(auditFieldLabel)
          .join(', ')}`;
      } else if (typeof record.type === 'string' && record.value !== undefined) {
        summary = `${record.type}: ${String(record.value)}`;
      } else if (typeof record.name === 'string') summary = record.name;
    }
  } catch {
    summary = safe;
  }
  if (!summary.trim()) return 'Informações adicionais disponíveis nos detalhes.';
  const compact = summary.replace(/\s+/g, ' ').trim();
  return compact.length > 180 ? `${compact.slice(0, 177)}…` : compact;
};
