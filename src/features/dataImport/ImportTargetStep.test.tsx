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

  it('na imagem mostra só os destinos que a foto pode atender e o que ela exige', async () => {
    segment.rawSegment = 'BARBERSHOP';
    const onChoose = vi.fn().mockResolvedValue(undefined);
    render(
      <ImportTargetStep
        busy={false}
        sheets={[{ sheetName: null, headers: ['Coluna 1'], preview: [], totalRows: 1 }]}
        destinos={[
          {
            targetType: 'CLIENTS',
            rotulo: 'Clientes',
            obrigatorios: ['name', 'whatsapp'],
            observacao: 'Nome e WhatsApp são obrigatórios: a foto precisa mostrar as duas colunas.',
          },
          {
            targetType: 'SERVICES',
            rotulo: 'Serviços',
            obrigatorios: ['serviceName', 'price'],
            observacao: 'A foto precisa mostrar o nome e o preço do serviço.',
          },
        ]}
        onChoose={onChoose}
      />,
    );

    // Só os destinos da imagem aparecem.
    expect(screen.queryByTestId('import-target-card-APPOINTMENTS')).not.toBeInTheDocument();
    expect(screen.getByTestId('import-target-card-CLIENTS')).toBeInTheDocument();
    expect(screen.getByTestId('import-target-card-SERVICES')).toBeInTheDocument();
    // E a tela diz o que a foto precisa mostrar.
    expect(
      screen.getByText('Nome e WhatsApp são obrigatórios: a foto precisa mostrar as duas colunas.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('import-target-card-SERVICES'));
    fireEvent.click(screen.getByTestId('import-target-continue'));
    expect(onChoose).toHaveBeenCalledWith([{ sheetName: null, targetType: 'SERVICES' }]);
  });
});
