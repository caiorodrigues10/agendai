/// <reference types="vitest/globals" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataExportWizard } from './DataExportWizard';

const segment = { rawSegment: null as string | null };

vi.mock('../../hooks/useSegmentLabels', () => ({
  useSegmentLabels: () => ({ rawSegment: segment.rawSegment }),
}));

describe('DataExportWizard', () => {
  beforeEach(() => {
    segment.rawSegment = null;
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
});
