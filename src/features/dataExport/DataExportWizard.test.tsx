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

  it('envia includeCase=true na API com cases em modules ao clicar em Exportar com toggle ligado', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    // cases já vem marcado por padrão para LAW_FIRM; só liga o toggle
    fireEvent.click(screen.getByTestId('export-include-case'));

    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(vi.mocked(dataExportApi.dataExportApi.create)).toHaveBeenCalledTimes(1);
    });

    const callArg = vi.mocked(dataExportApi.dataExportApi.create).mock.calls[0][1];
    expect(callArg.modules).toContain('cases');
    expect(callArg.options.includeCase).toBe(true);
  });

  it('envia includeCase=false na API com cases em modules quando toggle está desligado', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    // cases já vem marcado; não ativa o toggle includeCase
    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(vi.mocked(dataExportApi.dataExportApi.create)).toHaveBeenCalledTimes(1);
    });

    const callArg = vi.mocked(dataExportApi.dataExportApi.create).mock.calls[0][1];
    expect(callArg.modules).toContain('cases');
    expect(callArg.options.includeCase).toBe(false);
  });

  it('mostra aviso de erro quando includeCase está ligado sem módulo Processos', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    // interage para ativar o aviso (desmarca cases e liga includeCase)
    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-include-case'));

    const warning = screen.getByTestId('export-case-warning');
    expect(warning).toHaveTextContent(
      'Incluir caso/processo requer o módulo Processos selecionado.',
    );
    expect(warning).toHaveClass('text-danger');
  });

  it('desabilita "Gerar planilha" quando o aviso de erro está ativo', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-include-case'));

    expect(screen.getByTestId('export-generate')).toBeDisabled();
  });

  it('não mostra aviso no estado inicial para LAW_FIRM (sem interação)', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    expect(screen.queryByTestId('export-case-warning')).not.toBeInTheDocument();
  });

  it('mostra aviso de warning quando Processos está marcado sem includeCase', () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    // interage para ativar o aviso sem alterar cases/includeCase
    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-module-cases'));

    const warning = screen.getByTestId('export-case-warning');
    expect(warning).toHaveTextContent(
      'O módulo Processos está selecionado, mas “Incluir caso/processo” está desligado',
    );
    expect(warning).toHaveClass('text-accent');
  });
});
