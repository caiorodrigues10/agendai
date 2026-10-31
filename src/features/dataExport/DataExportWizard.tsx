import React from 'react';
import { Button } from '../../components/ui/Button';
import { LuDownload as Download, LuTrash2 as Trash2, LuFileSpreadsheet as FileSpreadsheet, LuCheck as Check } from 'react-icons/lu';
import { dataExportApi, type ExportJob, type ExportPeriodPreset, type ExportModuleKey, type ExportFormat } from '../../infra/dataExportApi';
import { authStorage } from '../../infra/authStorage';

const PERIOD_CARDS: { preset: ExportPeriodPreset; label: string; description: string }[] = [
  { preset: 'TODAY', label: 'Hoje', description: 'O dia inteiro' },
  { preset: 'THIS_WEEK', label: 'Esta semana', description: 'Domingo a sábado' },
  { preset: 'THIS_MONTH', label: 'Este mês', description: 'Do dia 1 até hoje' },
  { preset: 'LAST_3_MONTHS', label: '3 meses', description: 'Últimos 3 meses' },
  { preset: 'LAST_6_MONTHS', label: '6 meses', description: 'Últimos 6 meses' },
  { preset: 'LAST_12_MONTHS', label: '1 ano', description: 'Últimos 12 meses' },
  { preset: 'CUSTOM', label: 'Personalizado', description: 'Data inicial e final' },
  { preset: 'ALL', label: 'Tudo', description: 'Backup completo' },
];

const MODULE_GROUPS: { group: string; modules: { key: ExportModuleKey; label: string }[] }[] = [
  {
    group: 'Essencial',
    modules: [
      { key: 'appointments', label: 'Agendamentos' },
      { key: 'clients', label: 'Clientes' },
      { key: 'services', label: 'Serviços' },
      { key: 'team', label: 'Equipe' },
    ],
  },
  {
    group: 'Financeiro',
    modules: [
      { key: 'financial', label: 'Financeiro (receitas, despesas, caixa, lucro)' },
      { key: 'commissions', label: 'Comissões' },
    ],
  },
  {
    group: 'Comércio',
    modules: [
      { key: 'products', label: 'Produtos e estoque' },
      { key: 'sales', label: 'Vendas (PDV)' },
      { key: 'packages', label: 'Pacotes' },
      { key: 'fiado', label: 'Fiado' },
    ],
  },
  {
    group: 'Relacionamento',
    modules: [
      { key: 'queue', label: 'Fila' },
      { key: 'waitlist', label: 'Lista de espera' },
      { key: 'reviews', label: 'Avaliações' },
      { key: 'loyalty', label: 'Fidelidade, indicações e vouchers' },
      { key: 'posts', label: 'Posts e galeria' },
    ],
  },
  {
    group: 'Configurações',
    modules: [{ key: 'settings', label: 'Configurações do negócio' }],
  },
];

export const DataExportWizard: React.FC<{ barbershopId: string; onNotify: (message: string, type: 'success' | 'error') => void }> = ({
  barbershopId,
  onNotify,
}) => {
  const [preset, setPreset] = React.useState<ExportPeriodPreset>('THIS_MONTH');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [modules, setModules] = React.useState<ExportModuleKey[]>([
    'appointments',
    'clients',
    'services',
    'team',
    'financial',
    'commissions',
  ]);
  const [format, setFormat] = React.useState<ExportFormat>('XLSX');
  const [anonymize, setAnonymize] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [currentJob, setCurrentJob] = React.useState<ExportJob | null>(null);
  const [history, setHistory] = React.useState<ExportJob[]>([]);

  const loadHistory = React.useCallback(async () => {
    try {
      const jobs = await dataExportApi.list(barbershopId);
      setHistory(jobs);
    } catch (error) {
      onNotify('Não foi possível carregar o histórico de exportações.', 'error');
    }
  }, [barbershopId, onNotify]);

  React.useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // Polling do job atual até ele sair de "processando".
  React.useEffect(() => {
    if (!currentJob || currentJob.status !== 'PROCESSING' && currentJob.status !== 'PENDING') {
      return;
    }
    const timer = window.setInterval(async () => {
      try {
        const job = await dataExportApi.get(barbershopId, currentJob.id);
        setCurrentJob(job);
        if (job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'EXPIRED') {
          void loadHistory();
        }
      } catch {
        // Ignora falhas transitórias de rede.
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [currentJob, barbershopId, loadHistory]);

  const toggleModule = (key: ExportModuleKey): void => {
    setModules((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  const applyPreset = (presetName: 'GERENTIAL' | 'BACKUP'): void => {
    if (presetName === 'GERENTIAL') {
      setModules(['financial', 'commissions', 'services', 'team']);
    } else {
      setModules([
        'appointments',
        'clients',
        'services',
        'team',
        'financial',
        'commissions',
        'products',
        'sales',
        'packages',
        'fiado',
        'queue',
        'waitlist',
        'reviews',
        'loyalty',
        'posts',
        'settings',
      ]);
    }
  };

  const handleGenerate = async (): Promise<void> => {
    setBusy(true);
    try {
      const job = await dataExportApi.create(barbershopId, {
        periodPreset: preset,
        dateFrom: preset === 'CUSTOM' ? dateFrom : undefined,
        dateTo: preset === 'CUSTOM' ? dateTo : undefined,
        modules,
        format,
        options: { anonymize },
      });
      setCurrentJob(job);
      onNotify('Exportação enfileirada. Acompanhe o progresso abaixo.', 'success');
      void loadHistory();
    } catch (error) {
      onNotify('Não foi possível gerar a exportação.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (job: ExportJob): Promise<void> => {
    try {
      const url = dataExportApi.downloadUrl(barbershopId, job.id);
      const tokenValue = authStorage.getAccessToken();
      const response = await fetch(url, {
        headers: tokenValue ? { Authorization: `Bearer ${tokenValue}` } : {},
        credentials: 'include',
      });
      if (!response.ok) throw new Error('download failed');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = job.fileName ?? 'exportacao.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      onNotify('Não foi possível baixar a exportação (link expirado?).', 'error');
    }
  };

  const handleRemove = async (job: ExportJob): Promise<void> => {
    try {
      await dataExportApi.remove(barbershopId, job.id);
      await loadHistory();
      if (currentJob?.id === job.id) setCurrentJob(null);
    } catch {
      onNotify('Não foi possível excluir a exportação.', 'error');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5" data-testid="data-export-wizard">
      <div className="mb-4 flex items-center gap-2">
        <FileSpreadsheet size={18} className="text-text-primary" aria-hidden="true" />
        <h3 className="text-lg font-bold text-text-primary">Exportar dados</h3>
      </div>

      <p className="mb-4 text-sm text-text-secondary">
        Gera uma planilha com os dados do negócio para o período escolhido. Contém dados pessoais de clientes —
        proteja o arquivo conforme a LGPD.
      </p>

      {/* Período */}
      <section className="mb-5">
        <h4 className="mb-2 text-sm font-semibold text-text-primary">Período</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PERIOD_CARDS.map((card) => (
            <button
              key={card.preset}
              type="button"
              onClick={() => setPreset(card.preset)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                preset === card.preset
                  ? 'border-accent bg-accent/10 text-text-primary'
                  : 'border-border bg-bg text-text-secondary hover:bg-surface'
              }`}
              data-testid={`export-period-${card.preset}`}
            >
              <div className="font-semibold">{card.label}</div>
              <div className="text-xs opacity-80">{card.description}</div>
            </button>
          ))}
        </div>
        {preset === 'CUSTOM' ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs text-text-secondary">
              Data inicial
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-text-primary"
                data-testid="export-date-from"
              />
            </label>
            <label className="text-xs text-text-secondary">
              Data final
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-text-primary"
                data-testid="export-date-to"
              />
            </label>
          </div>
        ) : null}
      </section>

      {/* O que incluir */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary">O que incluir</h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => applyPreset('GERENTIAL')}
              className="text-xs text-accent hover:underline"
              data-testid="export-preset-gerential"
            >
              Relatório gerencial
            </button>
            <button
              type="button"
              onClick={() => applyPreset('BACKUP')}
              className="text-xs text-accent hover:underline"
              data-testid="export-preset-backup"
            >
              Backup completo
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {MODULE_GROUPS.map((group) => (
            <div key={group.group}>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">{group.group}</div>
              <div className="flex flex-wrap gap-2">
                {group.modules.map((module) => (
                  <label
                    key={module.key}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-bg px-2 py-1 text-xs text-text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={modules.includes(module.key)}
                      onChange={() => toggleModule(module.key)}
                      data-testid={`export-module-${module.key}`}
                    />
                    {module.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formato e opções */}
      <section className="mb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm text-text-primary">
            Formato
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value as ExportFormat)}
              className="mt-1 w-full rounded-lg border border-border bg-bg px-2 py-1.5 text-text-primary"
              data-testid="export-format"
            >
              <option value="XLSX">Excel (.xlsx)</option>
              <option value="CSV_ZIP">CSVs em .zip</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={anonymize}
              onChange={(event) => setAnonymize(event.target.checked)}
              data-testid="export-anonymize"
            />
            Anonimizar dados pessoais (relatório para contador)
          </label>
        </div>
      </section>

      <Button
        onClick={() => void handleGenerate()}
        disabled={busy || modules.length === 0}
        data-testid="export-generate"
      >
        {busy ? 'Gerando...' : 'Gerar planilha'}
      </Button>

      {currentJob ? (
        <div className="mt-5 rounded-xl border border-border bg-bg p-3" data-testid="export-progress">
          <div className="flex items-center justify-between text-sm text-text-primary">
            <span>
              {currentJob.status === 'COMPLETED'
                ? 'Pronto para download'
                : currentJob.status === 'FAILED'
                  ? 'Falhou'
                  : 'Gerando...'}
            </span>
            {currentJob.progress ? (
              <span className="text-xs text-text-secondary">
                {currentJob.progress.sheetsDone}/{currentJob.progress.sheetsTotal} abas
                {currentJob.progress.currentSheet ? ` — ${currentJob.progress.currentSheet}` : ''}
              </span>
            ) : null}
          </div>
          {currentJob.status === 'COMPLETED' ? (
            <button
              type="button"
              onClick={() => void handleDownload(currentJob)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white"
              data-testid="export-download"
            >
              <Download size={14} /> Baixar {currentJob.fileName}
            </button>
          ) : null}
          {currentJob.status === 'FAILED' ? (
            <p className="mt-2 text-xs text-danger">{currentJob.errorMessage}</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-6">
        <h4 className="mb-2 text-sm font-semibold text-text-primary">Histórico</h4>
        {history.length === 0 ? (
          <p className="text-xs text-text-secondary" data-testid="export-history-empty">
            Nenhuma exportação ainda.
          </p>
        ) : (
          <ul className="space-y-2" data-testid="export-history">
            {history.map((job) => (
              <li
                key={job.id}
                className="flex items-center justify-between rounded-lg border border-border bg-bg px-3 py-2 text-sm"
                data-testid={`export-history-item-${job.id}`}
              >
                <div>
                  <div className="font-medium text-text-primary">{job.fileName ?? job.periodPreset}</div>
                  <div className="text-xs text-text-secondary">
                    {new Date(job.createdAt).toLocaleString('pt-BR')} · {job.fileSizeBytes ?? 0} bytes · {job.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  {job.status === 'COMPLETED' ? (
                    <button
                      type="button"
                      onClick={() => void handleDownload(job)}
                      className="rounded-lg border border-border px-2 py-1 text-xs"
                      data-testid={`export-download-${job.id}`}
                    >
                      <Download size={12} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleRemove(job)}
                    className="rounded-lg border border-border px-2 py-1 text-xs"
                    data-testid={`export-remove-${job.id}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
