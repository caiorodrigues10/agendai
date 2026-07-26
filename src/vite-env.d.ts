/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public key do Mercado Pago — usada apenas para tokenizar cartão no browser. */
  readonly VITE_MERCADOPAGO_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
