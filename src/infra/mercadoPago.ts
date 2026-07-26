import { initMercadoPago } from '@mercadopago/sdk-react';

let initialized = false;

/**
 * Inicializa o SDK do Mercado Pago com a public key (idempotente).
 * Retorna false quando a chave não está configurada — o checkout de cartão
 * deve exibir orientação em vez de quebrar.
 */
export const ensureMercadoPago = (): boolean => {
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) return false;
  if (!initialized) {
    initMercadoPago(publicKey, { locale: 'pt-BR' });
    initialized = true;
  }
  return true;
};
