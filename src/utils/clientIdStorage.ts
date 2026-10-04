/**
 * Id anônimo do cliente na fila pública (D-015, passo 2).
 *
 * A chave original `barber_customer_id` não tinha namespace `agendai:`; a migração é
 * read-once: na primeira leitura sem a chave nova, o valor legado é adotado, regravado
 * namespaced e a chave antiga é removida.
 */
export const CLIENT_ID_STORAGE_KEY = 'agendai:barber_customer_id';
export const LEGACY_CLIENT_ID_STORAGE_KEY = 'barber_customer_id';

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
    cid = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_STORAGE_KEY, cid);
  }
  return cid;
}
