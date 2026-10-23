/**
 * Aviso de render: quais caracteres o usuário digitou serão descartados
 * na imagem do post (sem glifo na fonte do motor) e se o texto é cortado.
 *
 * Espelho das regras de `templates/_engine/sanitize.ts` do backend — o motor
 * mantém só o alfabeto Montserrat/Inter (Latin + acentos pt-BR + pontuação,
 * "R$"/"€") e normaliza espaços. Contrato compartilhado dos dois lados:
 * `backend/src/modules/posts/templates/_engine/glyphFixtures.json`
 * (testado dos dois lados — mantenha os arquivos iguais).
 */

/** Igual ao `KEEP` do backend. */
const KEEP_FULL = /[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,;:!?'"()\-–—/+@#%&*°ºª$R€£]/gu;
/** Idem, sem `\s` — espaço normalizado não é caractere perdido. */
const KEEP_ONE = /[A-Za-zÀ-ÖØ-öø-ÿ0-9.,;:!?'"()\-–—/+@#%&*°ºª$R€£]/u;

export interface RenderTextWarning {
  /** Caracteres removidos (sem espaço), únicos e na ordem de digitação. */
  dropped: string[];
  /** O texto passa do limite do modelo e é cortado na imagem. */
  truncated: boolean;
}

export const EMPTY_WARNING: RenderTextWarning = { dropped: [], truncated: false };

/**
 * @param raw texto digitado (título, CTA…)
 * @param max limite de caracteres do modelo (o backend corta na fronteira de palavra)
 */
export function renderTextWarning(raw: string | null | undefined, max: number): RenderTextWarning {
  if (!raw) return EMPTY_WARNING;
  const source = String(raw);
  // Grafemas (emoji + VS16/qualificadores contam 1) p/ o aviso não sair quebrado.
  const units =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(source), (s) => s.segment)
      : Array.from(source);
  const dropped: string[] = [];
  const seen = new Set<string>();
  for (const unit of units) {
    if (!unit.trim()) continue; // espaço normalizado não é caractere perdido
    // Mesma régua do back: o grafema só é mantido se TODOS os code points
    // têm glifo (sem isso "1️⃣"/"e\u0301" escapavam do aviso).
    if (Array.from(unit).every((ch) => KEEP_ONE.test(ch))) continue;
    if (seen.has(unit)) continue;
    seen.add(unit);
    dropped.push(unit);
  }
  const kept = (source.match(KEEP_FULL) || []).join("").replace(/\s+/g, " ").trim();
  return { dropped, truncated: kept.length > max };
}

/** Frase de aviso pronta p/ o editor (vazia quando não há o que avisar). */
export function renderTextWarningMessage(warning: RenderTextWarning, fieldLabel: string, max: number): string {
  const dropped = warning.dropped.length ? warning.dropped.join(" ") : null;
  const truncated = warning.truncated;
  if (dropped && truncated) {
    return `${fieldLabel}: ${dropped} não têm letra na fonte do post e serão ignorados na imagem; o texto passa de ${max} caracteres e também é cortado.`;
  }
  if (dropped) {
    return `${fieldLabel}: ${dropped} não têm letra na fonte do post e serão ignorados na imagem.`;
  }
  if (truncated) {
    return `${fieldLabel}: passa de ${max} caracteres e é cortado na imagem.`;
  }
  return "";
}
