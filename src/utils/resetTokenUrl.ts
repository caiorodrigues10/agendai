/**
 * Captura o `?token=` do link de redefinição de senha ANTES de qualquer init
 * de analytics e remove da URL do navegador.
 *
 * Motivo: a URL com o token vaza para GA/Meta (page_location), para o Referer
 * dos scripts de terceiros (gtag.js, fbevents.js) e para logs de servidor.
 * O token fica guardado aqui em memória (variável de módulo) e é lido por
 * `ResetPasswordPage` — o link continua funcionando, só a URL fica limpa.
 */

let pendingResetToken: string | null = null;

export function captureAndStripResetToken(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    // Só a rota de redefinição: outras páginas (ex.: review) usam ?token= próprio.
    if (url.pathname !== '/reset-password') return;
    const token = url.searchParams.get('token');
    if (!token) return;
    pendingResetToken = token;
    url.searchParams.delete('token');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
  } catch {
    // URL inválida — deixa a página mostrar "Link inválido" normalmente.
  }
}

export function getPendingResetToken(): string | null {
  return pendingResetToken;
}
