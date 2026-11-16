/**
 * Id anônimo do cliente na fila pública (D-015, passo 2).
 *
 * A chave original `barber_customer_id` não tinha namespace `agendai:`; a migração é
 * read-once: na primeira leitura sem a chave nova, o valor legado é adotado, regravado
 * namespaced e a chave antiga é removida.
 */
export const CLIENT_ID_STORAGE_KEY = 'agendai:barber_customer_id';
export const LEGACY_CLIENT_ID_STORAGE_KEY = 'barber_customer_id';

/**
 * Bytes aleatórios para o id.
 *
 * `crypto.getRandomValues` NÃO é restrito a contexto seguro (ao contrário de
 * `crypto.randomUUID`), então funciona em qualquer origem, inclusive
 * `http://` não-loopback. O branch com `Math.random` só existe para ambientes
 * sem Web Crypto — é o último recurso para a ausência da API não derrubar a
 * SPA.
 */
function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
    return bytes;
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/** Formata 16 bytes como UUID v4 (versão 4, variante 10xx). */
function toUuidV4(bytes: Uint8Array): string {
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0'));
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

/**
 * Gera o id do cliente.
 *
 * `crypto.randomUUID()` só existe em **contexto seguro** (HTTPS ou loopback).
 * Em `http://` não-loopback a propriedade é `undefined` e a chamada lançava
 * `TypeError: crypto.randomUUID is not a function` — como `readClientId` roda
 * no `useState` do `SchedulingContext`, isso derrubava a SPA inteira no boot
 * (tela em branco) em qualquer origem http:// não-loopback.
 *
 * O fallback monta um UUID v4 com `crypto.getRandomValues`, disponível em
 * todos os contextos.
 */
function generateClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  return toUuidV4(bytes);
}

export function readClientId(): string {
  let cid = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
  if (!cid) {
    cid = localStorage.getItem(LEGACY_CLIENT_ID_STORAGE_KEY);
    if (cid) {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, cid);
      try {
        localStorage.removeItem(LEGACY_CLIENT_ID_STORAGE_KEY);
      } catch {
        /* noop */
      }
    }
  }
  if (!cid) {
    cid = generateClientId();
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, cid);
  }
  return cid;
}
