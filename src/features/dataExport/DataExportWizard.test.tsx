/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataExportWizard } from './DataExportWizard';
import * as dataExportApi from '../../infra/dataExportApi';

const segment = { rawSegment: null as string | null };

vi.mock('../../hooks/useSegmentLabels', () => ({
  useSegmentLabels: () => ({ rawSegment: segment.rawSegment }),
}));

describe('DataExportWizard', () => {
  beforeEach(() => {
    segment.rawSegment = null;
    vi.spyOn(dataExportApi.dataExportApi, 'create').mockResolvedValue({ id: 'export-1' });
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

  it('envia includeCase=true na API ao clicar em Exportar com toggle ligado', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    fireEvent.click(screen.getByTestId('export-include-case'));

    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(dataExportApi.dataExportApi.create).toHaveBeenCalledTimes(1);
    });

    const callArg = dataExportApi.dataExportApi.create.mock.calls[0][1];
    expect(callArg.options.includeCase).toBe(true);
  });

  it('envia includeCase=false quando toggle está desligado', async () => {
    segment.rawSegment = 'LAW_FIRM';
    render(<DataExportWizard barbershopId="shop-1" onNotify={vi.fn()} />);

    fireEvent.click(screen.getByTestId('export-module-cases'));
    // não ativa o toggle includeCase

    fireEvent.click(screen.getByTestId('export-generate'));

    await waitFor(() => {
      expect(dataExportApi.dataExportApi.create).toHaveBeenCalledTimes(1);
    });

    const callArg = dataExportApi.dataExportApi.create.mock.calls[0][1];
    expect(callArg.options.includeCase).toBe(false);
  });
});