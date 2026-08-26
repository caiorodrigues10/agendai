/**
 * Utilitários de CPF/CNPJ/Telefone para o frontend.
 * Validação de CPF/CNPJ portada de agendai-back-end/src/shared/utils/cpfUtils.ts
 * (algoritmo oficial dos dígitos verificadores).
 */

export const normalizeDocument = (value: string): string => value.replace(/\D/g, '');

// --- Máscaras ---

export const maskCpf = (value: string): string => {
  const d = normalizeDocument(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
};

export const maskCnpj = (value: string): string => {
  const d = normalizeDocument(value).slice(0, 14);
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
};

/** (00) 00000-0000 ou (00) 0000-0000 — máscara BR */
export const maskPhone = (value: string): string => {
  const d = normalizeDocument(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

// --- Validações ---

export const isValidCpf = (raw: string): boolean => {
  const cpf = normalizeDocument(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf[10]);
};

export const isValidCnpj = (raw: string): boolean => {
  const cnpj = normalizeDocument(raw);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcDigit = (base: string, weights: number[]): number => {
    const sum = weights.reduce((acc, w, i) => acc + parseInt(base[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcDigit(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d1 !== parseInt(cnpj[12])) return false;
  const d2 = calcDigit(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d2 === parseInt(cnpj[13]);
};

/** Valida telefone BR: 10-11 dígitos (DDD + 8 ou 9 dígitos) */
export const isValidPhoneBR = (raw: string): boolean => {
  const digits = normalizeDocument(raw);
  if (digits.length < 10 || digits.length > 11) return false;
  // DDD não pode ser 00
  if (digits.startsWith('00')) return false;
  // Celular (11 dígitos) deve começar com 9
  if (digits.length === 11 && digits[2] !== '9') return false;
  return true;
};

export const isValidDocument = (type: 'CPF' | 'CNPJ', raw: string): boolean =>
  type === 'CPF' ? isValidCpf(raw) : isValidCnpj(raw);
