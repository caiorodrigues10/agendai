/**
 * Testes do ImportReviewStep — células "revisar" do OCR e botão Confirmar.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ImportReviewStep } from './ImportReviewStep';
import type { ImportFieldKey, ImportValidationSummary } from '../../infra/dataImportApi';

const onConfirm = vi.fn();
const onRevalidate = vi.fn();
const onBack = vi.fn();

const validation = {
  totalRows: 3,
  validRows: 3,
  skippedRows: 0,
  failedRows: 0,
  results: [
    { rowNumber: 1, status: 'VALID' as const },
    {
      rowNumber: 2,
      status: 'VALID' as const,
      revisar: true,
      field: 'whatsapp' as ImportFieldKey,
      message: 'Telefone lido por OCR com confiança baixa.',
    },
    {
      rowNumber: 3,
      status: 'VALID' as const,
      revisar: true,
      field: 'salePrice' as ImportFieldKey,
      message: 'Valor lido por OCR com confiança baixa.',
    },
  ],
  warnings: [],
};

const renderStep = (validationOverride?: ImportValidationSummary) =>
  render(
    <ImportReviewStep
      validation={{ ...validation, ...validationOverride }}
      busy={false}
      onBack={onBack}
      onRevalidate={onRevalidate}
      onConfirm={onConfirm}
    />,
  );

describe('ImportReviewStep — revisar células OCR', () => {
  it('botão Confirmar desabilitado quando há células para revisar', () => {
    renderStep();
    expect(
      screen.getByTestId('import-review-confirm'),
    ).toBeDisabled();
    expect(screen.getByTestId('import-review-pending')).toBeInTheDocument();
  });

  it('marca célula como revisada e habilita Confirmar quando todas revisadas', () => {
    renderStep();
    const botoes = screen.getAllByTestId(
      /^import-review-toggle-/,
    );
    expect(botoes).toHaveLength(2);

    fireEvent.click(botoes[0]);
    expect(screen.getByTestId('import-review-confirm')).toBeDisabled();

    fireEvent.click(botoes[1]);
    expect(screen.getByTestId('import-review-confirm')).not.toBeDisabled();
    expect(screen.getByTestId('import-review-all-done')).toBeInTheDocument();
  });

  it('não desabilita Confirmar quando não há células para revisar', () => {
    renderStep({
      ...validation,
      results: validation.results.filter((r) => !r.revisar),
    });
    expect(screen.getByTestId('import-review-confirm')).not.toBeDisabled();
    expect(screen.queryByTestId('import-review-pending')).not.toBeInTheDocument();
  });

  it('chama onConfirm ao clicar quando habilitado', () => {
    renderStep({
      ...validation,
      results: validation.results.filter((r) => !r.revisar),
    });
    fireEvent.click(screen.getByTestId('import-review-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
