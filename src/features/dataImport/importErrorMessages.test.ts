/**
 * Testes das mensagens de erro do assistente de importação.
 *
 * O backend manda um `code` estável; a tela traduz o código em uma mensagem
 * que diz o que fazer. Sem código conhecido, a mensagem do servidor vale —
 * e, se não houver, uma mensagem genérica por status HTTP.
 */
import { describe, it, expect } from 'vitest';
import { ApiError } from '../../infra/apiClient';
import { importErrorMessage } from './importErrorMessages';

describe('importErrorMessage', () => {
  it('traduz cada código de erro do OCR em uma mensagem específica', () => {
    const codigos = [
      'OCR_DISABLED',
      'OCR_QUEUE_FULL',
      'OCR_IMAGE_TOO_LARGE',
      'OCR_IMAGE_FORMAT_INVALID',
      'OCR_IMAGE_LOW_RESOLUTION',
      'OCR_TRAINEDDATA_MISSING',
      'OCR_NO_TABLE',
      'OCR_REVIEW_PENDING',
    ];
    const mensagens = codigos.map((code) =>
      importErrorMessage(new ApiError('mensagem genérica do servidor', 400, code))
    );
    // Cada código tem que dar uma mensagem diferente e útil.
    expect(new Set(mensagens).size).toBe(codigos.length);
    for (const mensagem of mensagens) {
      expect(mensagem.length).toBeGreaterThan(20);
      expect(mensagem).not.toContain('mensagem genérica do servidor');
    }
  });

  it('usa a mensagem do servidor quando o código não é de OCR', () => {
    const erro = new ApiError('A aba escolhida não existe mais na planilha.', 400, 'PLANILHA_SEM_ABA');
    expect(importErrorMessage(erro)).toBe('A aba escolhida não existe mais na planilha.');
  });

  it('usa a mensagem do servidor quando não há código', () => {
    const erro = new ApiError('Não foi possível ler a imagem.', 400);
    expect(importErrorMessage(erro)).toBe('Não foi possível ler a imagem.');
  });

  it('cai na mensagem por status quando o servidor não manda texto útil', () => {
    const erro = new ApiError('HTTP 503', 503);
    expect(importErrorMessage(erro)).toContain('indisponível');
  });

  it('não some com a mensagem do erro comum', () => {
    expect(importErrorMessage(new Error('Falha na leitura do arquivo.'))).toBe(
      'Falha na leitura do arquivo.'
    );
  });

  it('tem mensagem padrão quando o erro não diz nada', () => {
    expect(importErrorMessage(undefined)).toBe(
      'Não foi possível concluir a importação. Tente de novo.'
    );
    expect(importErrorMessage(new Error(''))).toBe(
      'Não foi possível concluir a importação. Tente de novo.'
    );
  });
});
