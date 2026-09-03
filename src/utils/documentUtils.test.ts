import { describe, expect, it } from 'vitest';
import { isValidPhoneBR, maskPhone, normalizePhoneBR } from './documentUtils';
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
