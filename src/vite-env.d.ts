/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  /** Public key do Mercado Pago — usada apenas para tokenizar cartão no browser. */
  readonly VITE_MERCADOPAGO_PUBLIC_KEY?: string;
  /** URL base da API backend. */
  readonly VITE_API_URL?: string;
  /** Site key do Google reCAPTCHA. */
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  /** Client ID do Google OAuth. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** URL opcional do vídeo curto de demonstração usado na landing page. */
  readonly VITE_PRODUCT_TOUR_VIDEO_URL?: string;
  /** URL opcional do vídeo vertical que ensina a instalar o PWA. */
  readonly VITE_PWA_INSTALL_VIDEO_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
