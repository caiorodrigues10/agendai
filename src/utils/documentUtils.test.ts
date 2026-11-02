/// <reference types="vitest/globals" />
import { isValidPhoneBR, maskPhone, normalizePhoneBR, isValidCpf, maskCpf } from './documentUtils';
import { CustomerQueueSchema } from '../schemas';

describe('maskPhone', () => {
  it('aceita os 11 dígitos do celular sem saltar o hífen no nono dígito', () => {
    let value = '';
    for (const digit of '11987654321') {
      value = maskPhone(value + digit);
    }
    expect(normalizePhoneBR(value)).toBe('11987654321');
    expect(value).toBe('(11) 98765-4321');
  });

  it('mantém agrupamento 5+4 depois do 9 do celular', () => {
    expect(maskPhone('1198765')).toBe('(11) 98765');
    expect(maskPhone('1198765432')).toBe('(11) 98765-432');
    expect(maskPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
  });

  it('formata fixo com 8 dígitos locais', () => {
    expect(maskPhone('1138765432')).toBe('(11) 3876-5432');
  });

  it('remove DDI 55 de número completo colado', () => {
    expect(maskPhone('+55 11 98765-4321')).toBe('(11) 98765-4321');
    expect(normalizePhoneBR('+55 (11) 98765-4321')).toBe('11987654321');
    expect(isValidPhoneBR('+55 11 98765-4321')).toBe(true);
  });

  it('não trata DDD 55 como DDI em celular de 11 dígitos', () => {
    expect(normalizePhoneBR('55987654321')).toBe('55987654321');
    expect(maskPhone('55987654321')).toBe('(55) 98765-4321');
  });
});

describe('isValidCpf', () => {
  it('aceita CPF válido sem máscara', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('16899535009')).toBe(true);
  });

  it('aceita CPF válido com máscara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('rejeita sequência repetida (111.111.111-11)', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
  });

  it('rejeita dígitos verificadores incorretos', () => {
    expect(isValidCpf('52998224726')).toBe(false);
    expect(isValidCpf('12345678900')).toBe(false);
  });

  it('rejeita CPF com tamanho errado', () => {
    expect(isValidCpf('1234567890')).toBe(false);
    expect(isValidCpf('123456789012')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });
});

describe('maskCpf', () => {
  it('formata corretamente', () => {
    expect(maskCpf('52998224725')).toBe('529.982.247-25');
  });

  it('funciona com CPF já mascarado', () => {
    expect(maskCpf('529.982.247-25')).toBe('529.982.247-25');
  });
});

describe('CustomerQueueSchema whatsapp', () => {
  it('aceita celular mascarado com 11 dígitos', () => {
    const parsed = CustomerQueueSchema.safeParse({
      name: 'Maria Silva',
      whatsapp: '(11) 98765-4321',
      serviceId: 's1',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.whatsapp).toBe('11987654321');
  });

  it('aceita número colado com +55 acima de 15 caracteres', () => {
    const parsed = CustomerQueueSchema.safeParse({
      name: 'Maria Silva',
      whatsapp: '+55 11 98765-4321',
      serviceId: 's1',
    });
    expect(parsed.success).toBe(true);
  });
});
