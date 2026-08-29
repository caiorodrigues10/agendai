# Backlog Técnico — Frontend

## 2026-08-29 — Redesign UX: unificar dois blocos de WhatsApp em Configurações

**Arquivo afetado:** `src/components/domain/SettingsManager.tsx`

**Motivo:** Existiam dois blocos de WhatsApp em cards separados na tela de
Configurações — o input "WhatsApp de Avisos" (dentro do card "Configurações
Gerais") e o componente `<SalonWhatsAppConnection />` (card separado com QR
code e status de conexão). O usuário dono confundia os dois, achando que
estavam duplicados ou que eram a mesma coisa.

**Mudanças implementadas:**

| Item | Antes | Depois |
|------|-------|--------|
| Input "WhatsApp de Avisos" | Dentro do card "Configurações Gerais" (junto com Nome e Logo) | Movido para dentro do card unificado de WhatsApp |
| Container visual | Dois cards separados e independentes | Um único `<div>` com título "WhatsApp" contendo ambos |
| Sub-card de conexão | Título "WhatsApp do salão" com borda `border-accent/40` | Mantido, mas com subtítulo "Este é o número que **envia** as mensagens (fila, lembretes, posts)." |
| Rótulo input de avisos | "WhatsApp de Avisos" | "Receber avisos em outro número (opcional)" |
| Help text do input | "Número que recebe o aviso quando um cliente entra na fila. Quem envia é o WhatsApp conectado no cartão abaixo." | "Deixe em branco para usar o mesmo número conectado acima." |
| Card "Configurações Gerais" | Nome + Logo + WhatsApp de Avisos | Só Nome + Logo |

**Props do SalonWhatsAppConnection:**

| Prop | Tipo | Descrição |
|------|------|-----------|
| `barbershopId` | `string` (obrigatório) | ID da barbearia para consulta de status |
| `whatsapp` | `string` (novo) | Valor controlado do input de avisos |
| `onWhatsappChange` | `(value: string) => void` (novo) | Callback para atualizar o valor |

**Fluxo visual:** título "WhatsApp" → sub-card com QR/status → input "Receber avisos em outro número" → help text. Tudo num único card, sem ambiguidade.

---

## 2026-08-29 — Fix: Erro cru do Google vazando pro usuário no upload de logo/avatar

**Arquivos afetados:**
- Backend: `src/shared/container/providers/StorageProvider/implementations/GcsStorageProvider.ts`
- Frontend: `src/utils/errorMessage.ts`

**Motivo:** Quando GCS não está configurado (sem key file, sem credentials JSON,
sem ADC), as chamadas `generateSignedUploadUrl()` e `uploadBuffer()` do
GcsStorageProvider lançavam erros cru do `google-auth-library` (ex: "Could not
load the default credentials. Browse to https://cloud.google.com/docs/...") sem
nenhum tratamento. Como não são `AppError`, não tinham statusCode — e o
`errorMessage.ts` do frontend só substituía mensagens que batiam em
`TECHNICAL_PATTERN` ou `NETWORK_PATTERN`, deixando o texto técnico em inglês
vazar inteiro até a tela do usuário.

**Mudanças implementadas:**

| Arquivo | Mudança |
|---------|---------|
| `GcsStorageProvider.ts` | Novos métodos `isCredentialError()` e `wrapStorageError()` |
| `GcsStorageProvider.ts` | `generateSignedUploadUrl()` envolvido em try/catch → re-throw como `AppError` |
| `GcsStorageProvider.ts` | `uploadBuffer()` envolvido em try/catch → re-throw como `AppError` |
| `errorMessage.ts` | Novo regex `SDK_PATTERN` detecta termos como `credentials`, `google-auth`, `cloud.google.com/docs` |
| `errorMessage.ts` | `SDK_PATTERN` adicionado às checagens de `Error` e `ApiError` — trata como fallback técnico |

**Comportamento por cenário:**

- **Credencial ausente/inválida:** `AppError` 503 com mensagem PT-BR + `GCS_SETUP_HINT`
- **Erro de rede/bucket:** `AppError` 502 com mensagem PT-BR genérica (original logada no backend)
- **Frontend (defesa em profundidade):** `SDK_PATTERN` captura qualquer mensagem técnica de SDK de terceiro que chegue cru e retorna `fallback` em vez de expor o texto em inglês

**Validação:**
- `tsc --noEmit` backend: zero erros novos (todos os erros existentes são pré-existentes)
- `tsc --noEmit` frontend: zero erros novos (mesmos erros pré-existentes)
- Sem GCS: upload mostra "Não foi possível conectar ao storage de imagens..."
- Com GCS: upload continua funcionando sem regressão

**Fix (2026-08-29):** `wrapStorageError()` reembalava `AppError` já formatados
(503 com `GCS_SETUP_HINT`) que vinham de `bucketName getter`,
`assertValidCredentials()` e `assertServiceAccountJson()`, transformando-os na
mensagem genérica "Erro ao acessar o storage de imagens. Tente novamente." (502).
Corrigido adicionando `if (err instanceof AppError) throw err` no início de
`wrapStorageError()` para preservar erros já específicos.

---

## 2026-08-28 — Redesign UX: Agenda (Salão/Profissional)

**Arquivo afetado:** `src/components/domain/AppointmentCalendar.tsx`

**Motivo:** Quando a barbearia tem apenas 1 StaffMember, as abas "Salão" e
"Profissional" ficavam visualmente redundantes — a aba Profissional mostrava
o nome do profissional duas vezes (dropdown + cabeçalho de coluna), e a aba
Salão mostrava a mesma tabela com coluna extra "Sem prof.". Isso confundia o
usuário dono, que achava que a UI estava quebrada.

**Mudanças implementadas:**

| Item | Antes | Depois |
|------|-------|--------|
| Toggle Salão/Profissional | Sempre renderizado | Oculto quando `staff.length <= 1` |
| Default `view` | `'salon'` para owner | `'salon'` sempre (toggle inativo sem staff múltiplo) |
| Default `selectedStaffId` | `staff[0]?.id` para owner | `'any'` quando `staff.length > 1` e owner |
| Cabeçalho coluna (professional) | Nome do profissional (redundante) | Label neutro "Horários" |
| Subtítulo dropdown | Nenhum | "Visão por profissional" quando `staff.length > 1` |
| `useEffect` de reset | Nenhum | Força `view = 'salon'` se staff cai para <= 1 (exceto EMPLOYEE) |

**Comportamento por cenário:**

- `staff.length === 0`: Sem toggle, view fixa em `'salon'`, tabela com coluna "Sem prof."
- `staff.length === 1`: Sem toggle, view fixa em `'salon'`, tabela com 1 coluna (nome do profissional)
- `staff.length === 1` + `EMPLOYEE`: Sem toggle, view fixa em `'professional'`, nunca resetada pelo useEffect
- `staff.length > 1`: Toggle ativo, owner entra em "Qualquer profissional", employee continua fixo no próprio ID

**Fix (2026-08-28):** O `useEffect` de reset sobrescrevia a view `'professional'` de
funcionários (EMPLOYEE) em barbearias com 1 staff, forçando `'salon'` e violando a
regra de que EMPLOYEE sempre vê a própria agenda. Corrigido adicionando a checagem
`currentUserRole !== 'EMPLOYEE'` na condição do efeito.

**Fix 2 (2026-08-28):** Botão "Hoje" no cabeçalho da agenda sempre mostrava o texto
"Hoje" independente da data selecionada, induzindo o usuário a achar que estava no dia
atual. Corrigido para exibir "Hoje" quando `selectedDate` é hoje e "Voltar para hoje"
caso contrário.

---

## 2026-08-28 — Upload de logo na tela Perfil

**Arquivos afetados:** `src/components/domain/ShopProfile.tsx`,
`src/pages/StaffDashboard.tsx`

**Motivo:** A tela Perfil (`/app/profile`) só exibia a logo em modo leitura.
Como é onde o dono naturalmente vê o card do salão, precisava da mesma
capacidade de upload que já existia em Configurações (SettingsManager.tsx).

**Mudanças implementadas:**

| Item | Detalhe |
|------|---------|
| `onNotify` prop | Novo prop opcional na interface `ShopProfileProps` para reportar sucesso/erro |
| Estado local `logoUrl` | Sincronizado com `settings.logoUrl` via `useEffect` |
| `canEditLogo` | `true` quando `audience === 'staff'` E `currentUser.role === 'OWNER'` |
| Upload (overlay hover) | Padrão Camera overlay (`group-hover:opacity-100`) sobre a logo, `<input type="file">` oculto |
| Fluxo de upload | `getLogoUploadUrl` → PUT → `confirmLogo` (mesmo padrão do SettingsManager) |
| Remoção de logo | Botão "Remover logo" (Trash2) quando `logoUrl` existe, com `confirm()` antes |
| Aceitos | `image/jpeg`, `image/jpg`, `image/png`, `image/webp` |
| `StaffDashboard` | Passa `onNotify={showToast}` para `<ShopProfile />` |

**Comportamento por role:**

- `OWNER` + `audience='staff'`: Upload habilitado, hover mostra câmera, botão remover disponível
- `EMPLOYEE` + `audience='staff'`: Somente leitura (sem controles de edição)
- `audience='public'`: Somente leitura (comportamento inalterado)
