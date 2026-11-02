/// <reference types="vitest/globals" />
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ImportTargetStep } from './ImportTargetStep';

const segment = vi.hoisted(() => ({ rawSegment: null as string | null }));

vi.mock('../../hooks/useSegmentLabels', () => ({
  useSegmentLabels: () => ({ rawSegment: segment.rawSegment }),
}));

describe('ImportTargetStep', () => {
  it('esconde processos fora do segmento jurídico', () => {
    segment.rawSegment = 'BARBERSHOP';
    render(
      <ImportTargetStep
        busy={false}
        sheets={[{ sheetName: null, headers: [], preview: [], totalRows: 1 }]}
        onChoose={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('import-target-card-CASES')).not.toBeInTheDocument();
    expect(screen.getByTestId('import-target-card-CLIENTS')).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('mostra processos para escritório de advocacia e usa como padrão', async () => {
    segment.rawSegment = 'LAW_FIRM';
    const onChoose = vi.fn().mockResolvedValue(undefined);
    render(
      <ImportTargetStep
        busy={false}
        sheets={[{ sheetName: null, headers: [], preview: [], totalRows: 1 }]}
        onChoose={onChoose}
      />,
    );

    const card = screen.getByTestId('import-target-card-CASES');
    expect(card).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByTestId('import-target-continue'));
    expect(onChoose).toHaveBeenCalledWith([{ sheetName: null, targetType: 'CASES' }]);
  });
});
