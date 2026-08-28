/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public key do Mercado Pago — usada apenas para tokenizar cartão no browser. */
  readonly VITE_MERCADOPAGO_PUBLIC_KEY?: string;
  /** URL base da API backend. */
  readonly VITE_API_URL?: string;
  /** Site key do Google reCAPTCHA. */
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  /** Client ID do Google OAuth. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
