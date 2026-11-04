/**
 * Testes do ImportReviewStep — a tela de revisão do OCR.
 *
 * O que importa aqui: a célula mostra o valor lido, o dono corrige ou
 * aceita, e o botão Confirmar só libera quando não sobrou nenhuma célula
 * pendente.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ImportReviewStep } from './ImportReviewStep';
import type { ImportValidationSummary } from '../../infra/dataImportApi';

const onConfirm = vi.fn();
const onRevalidate = vi.fn();
const onBack = vi.fn();
const onReviewCell = vi.fn();

const validation: ImportValidationSummary = {
  totalRows: 2,
  validRows: 2,
  skippedRows: 0,
  failedRows: 0,
  results: [
    { rowNumber: 1, status: 'VALID' },
    {
      rowNumber: 2,
      status: 'VALID',
      revisar: true,
      celulasRevisar: [
        {
          linha: 2,
          coluna: 1,
          campo: 'whatsapp',
          valor: '11987654321',
          confianca: 45,
          motivo: 'Telefone lido por OCR com confiança baixa.',
          pendente: true,
          aceito: false,
          editado: false,
        },
      ],
    },
  ],
  warnings: [],
};

const renderStep = (summary: ImportValidationSummary = validation) =>
  render(
    <ImportReviewStep
      validation={summary}
      busy={false}
      onBack={onBack}
      onRevalidate={onRevalidate}
      onReviewCell={onReviewCell}
      onConfirm={onConfirm}
    />,
  );

describe('ImportReviewStep — revisão editável das células do OCR', () => {
  it('mostra a célula com o valor lido, a confiança e o badge "revisar"', () => {
    renderStep();
    expect(screen.getByTestId('import-review-input-2:1')).toHaveValue('11987654321');
    expect(screen.getByText('confiança 45%')).toBeInTheDocument();
    const badge = screen.getByTestId('import-review-badge-2:1');
    expect(badge).toHaveTextContent('revisar');
    expect(badge.querySelector('svg')).not.toBeNull();
  });

  it('mantém Confirmar desabilitado enquanto houver célula pendente', () => {
    renderStep();
    expect(screen.getByTestId('import-review-confirm')).toBeDisabled();
    expect(screen.getByTestId('import-review-pending')).toBeInTheDocument();
  });

  it('salva a correção com a linha, a coluna e o valor novo', () => {
    renderStep();
    const input = screen.getByTestId('import-review-input-2:1');
    fireEvent.change(input, { target: { value: '11999998888' } });
    fireEvent.click(screen.getByTestId('import-review-save-2:1'));
    expect(onReviewCell).toHaveBeenCalledTimes(1);
    expect(onReviewCell).toHaveBeenCalledWith({
      linha: 2,
      coluna: 1,
      valor: '11999998888',
    });
  });

  it('aceita a célula como está', () => {
    renderStep();
    fireEvent.click(screen.getByTestId('import-review-accept-2:1'));
    expect(onReviewCell).toHaveBeenCalledWith({ linha: 2, coluna: 1, aceitar: true });
  });

  it('libera Confirmar quando todas as células foram conferidas', () => {
    renderStep({
      ...validation,
      results: [
        validation.results[0],
        {
          ...validation.results[1],
          revisar: false,
          celulasRevisar: [
            {
              ...validation.results[1].celulasRevisar![0],
              pendente: false,
              aceito: true,
            },
          ],
        },
      ],
    });
    expect(screen.getByTestId('import-review-confirm')).not.toBeDisabled();
    expect(screen.getByTestId('import-review-all-done')).toBeInTheDocument();
    expect(screen.getByTestId('import-review-badge-2:1')).toHaveTextContent('aceito');
  });

  it('não desabilita Confirmar quando não há célula para revisar', () => {
    renderStep({ ...validation, results: [validation.results[0]] });
    expect(screen.getByTestId('import-review-confirm')).not.toBeDisabled();
    expect(screen.queryByTestId('import-review-pending')).not.toBeInTheDocument();
    expect(screen.queryByTestId('import-review-cells')).not.toBeInTheDocument();
  });

  it('chama onConfirm ao clicar quando habilitado', () => {
    renderStep({ ...validation, results: [validation.results[0]] });
    fireEvent.click(screen.getByTestId('import-review-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
