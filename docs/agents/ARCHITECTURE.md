# Arquitetura frontend e princípios

## Organização atual (não impor classes de backend ao React)

1. **Páginas** (`pages/`) — composição de rota.
2. **Domain** (`components/domain/`) — fluxos de negócio da UI.
3. **UI** (`components/ui/`) — apresentação reutilizável (`Field`, `SmartSelect`, …).
4. **Contexts / hooks** — estado e permissões com responsabilidade definida.
5. **Infra** (`infra/*Api.ts`) — contratos HTTP.
6. **Utils / schemas** — cálculos e validação testáveis (`schemas.ts`, `utils/`).

Autorização visual (`usePermissions`) **complementa** a validação do backend; nunca a substitui.

## Formulários

Padrão atual: `react-hook-form` + `zodResolver` + `Field` / `Controller` (para `SmartSelect`).

## SOLID / Clean Code (exemplos locais)

| Princípio | Aplicação |
|---|---|
| SRP | `apiClient` transporta HTTP; painéis não reimplementam auth |
| OCP | Novos wrappers `*Api.ts` sem alterar `apiClient` core |
| LSP | Mocks de teste respeitam o mesmo contrato de resposta `{ success, data }` |
| ISP | Contexts separados (Auth ≠ Scheduling ≠ Theme) |
| DIP | UI depende de wrappers, não de URLs cruas |

Complementos: nomes claros, tipos nas fronteiras HTTP, tratamento de `ApiError` / `SUBSCRIPTION_REQUIRED` / `CPF_BLOCKED`, comentários só para decisões.

**Não** exigir: limite arbitrário de linhas, 80% de cobertura universal, interface para toda função. Refatorações incrementais e proporcionais à tarefa.
