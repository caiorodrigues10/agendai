/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataExportWizard } from './DataExportWizard';
import * as dataExportApi from '../../infra/dataExportApi';
import type { ExportJob } from '../../infra/dataExportApi';

const segment = { rawSegment: null as string | null };

const exportJobFixture: ExportJob = {
  id: 'export-1',
  periodPreset: 'THIS_MONTH',
  periodFrom: null,
  periodTo: null,
  timezone: 'America/Sao_Paulo',
  modules: ['appointments', 'clients', 'services', 'team', 'financial', 'commissions'],
  options: { anonymize: false, includeCase: false },
  format: 'XLSX',
  status: 'PENDING',
  progress: null,
  fileSizeBytes: null,
  fileName: null,
  errorMessage: null,
  createdAt: '2026-01-01T00:00:00Z',
  finishedAt: null,
  expiresAt: null,
};

vi.mock('../../hooks/useSegmentLabels', () => ({
  useSegmentLabels: () => ({ rawSegment: segment.rawSegment }),
}));

describe('DataExportWizard', () => {
  beforeEach(() => {
    segment.rawSegment = null;
    vi.spyOn(dataExportApi.dataExportApi, 'create').mockResolvedValue(exportJobFixture);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('não mostra módulos jurídicos para segmento não jurídico', () => {
    segment.rawSegment = 'BARBERSHOP';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(screen.queryByTestId('export-module-cases')).not.toBeInTheDocument();
    expect(screen.queryByTestId('export-module-caseFees')).not.toBeInTheDocument();
  });

  it('mostra módulos jurídicos para segmento LAW_FIRM', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(screen.getByTestId('export-module-cases')).toBeInTheDocument();
    expect(screen.getByTestId('export-module-caseFees')).toBeInTheDocument();
  });

  it('mostra toggle de incluir caso para segmento jurídico', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(screen.getByTestId('export-include-case')).toBeInTheDocument();
  });

  it('não mostra toggle de incluir caso para segmento não jurídico', () => {
    segment.rawSegment = 'BARBERSHOP';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(screen.queryByTestId('export-include-case')).not.toBeInTheDocument();
  });

  it('inclui casos e caseFees no preset BACKUP para segmento jurídico', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-preset-backup'));

    expect(screen.getByTestId('export-module-cases')).toBeChecked();
    expect(screen.getByTestId('export-module-caseFees')).toBeChecked();
  });

  // ── (a) Processos é opt-in ────────────────────────────────────────────────

  it('(a) LAW_FIRM no estado inicial: cases não vem marcado e nenhum aviso aparece', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(screen.getByTestId('export-module-cases')).not.toBeChecked();
    expect(screen.queryByTestId('export-case-warning')).not.toBeInTheDocument();
  });

  it('(a) marcar cases sem includeCase mostra o aviso', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));

    const warning = screen.getByTestId('export-case-warning');
    expect(warning).toHaveTextContent(
      'O módulo Processos está selecionado, mas “Incluir caso/processo” está desligado',
    );
    expect(warning).toHaveClass('text-accent');
  });

  it('(a) marcar cases + includeCase: sem aviso e API recebe cases em modules e includeCase=true', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-include-case'));

    expect(screen.queryByTestId('export-case-warning')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(vi.mocked(dataExportApi.dataExportApi.create)).toHaveBeenCalledTimes(1);
    });

    const callArg = vi.mocked(dataExportApi.dataExportApi.create).mock.calls[0][1];
    expect(callArg.modules).toContain('cases');
    expect(callArg.options?.includeCase).toBe(true);
  });

  it('(a) includeCase ligado sem cases mostra aviso de erro e desabilita Gerar planilha', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-include-case'));

    const warning = screen.getByTestId('export-case-warning');
    expect(warning).toHaveTextContent(
      'Incluir caso/processo requer o módulo Processos selecionado.',
    );
    expect(warning).toHaveClass('text-danger');
    expect(screen.getByTestId('export-generate')).toBeDisabled();
  });

  // ── (b) anonymize + Processos ─────────────────────────────────────────────

  it('(b) anonymize ligado + cases marcado: includeCase continua habilitado', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-anonymize'));

    const toggle = screen.getByTestId('export-include-case');
    expect(toggle).toBeEnabled();
    expect(toggle).not.toBeChecked();
  });

  it('(b) anonymize ligado + cases + includeCase: API recebe anonymize=true e includeCase=true', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-include-case'));
    fireEvent.click(screen.getByTestId('export-anonymize'));

    expect(screen.queryByTestId('export-case-warning')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(vi.mocked(dataExportApi.dataExportApi.create)).toHaveBeenCalledTimes(1);
    });

    const callArg = vi.mocked(dataExportApi.dataExportApi.create).mock.calls[0][1];
    expect(callArg.modules).toContain('cases');
    expect(callArg.options?.anonymize).toBe(true);
    expect(callArg.options?.includeCase).toBe(true);
  });

  it('(b) o aviso não diz que includeCase está desativado pela anonimização', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-anonymize'));

    const warning = screen.getByTestId('export-case-warning');
    expect(warning).not.toHaveTextContent('anonimização');
    expect(warning).not.toHaveTextContent('desativado');
  });

  // ── (c) preset BACKUP ─────────────────────────────────────────────────────

  it('(c) preset BACKUP em LAW_FIRM: cases e caseFees marcados e includeCase ligado', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-preset-backup'));

    expect(screen.getByTestId('export-module-cases')).toBeChecked();
    expect(screen.getByTestId('export-module-caseFees')).toBeChecked();
    expect(screen.getByTestId('export-include-case')).toBeChecked();
    expect(screen.queryByTestId('export-case-warning')).not.toBeInTheDocument();
  });

  it('(c) preset BACKUP em LAW_FIRM envia cases em modules e includeCase=true', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-preset-backup'));
    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(vi.mocked(dataExportApi.dataExportApi.create)).toHaveBeenCalledTimes(1);
    });

    const callArg = vi.mocked(dataExportApi.dataExportApi.create).mock.calls[0][1];
    expect(callArg.modules).toContain('cases');
    expect(callArg.modules).toContain('caseFees');
    expect(callArg.options?.includeCase).toBe(true);
  });
});
