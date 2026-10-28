import React, { useState } from 'react';
import { LuLoaderCircle as Loader2, LuSave as Save } from 'react-icons/lu';
import { useBarbershop } from '../../contexts/BarbershopContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';
import { SocialNetworkIcon } from '../../components/domain/SocialLinks';
import {
  SOCIAL_NETWORKS,
  SOCIAL_NETWORK_DEFS,
  normalizeSocialLink,
  type SocialLinks,
  type SocialNetwork,
} from '../../utils/socialLinks';

const EMPTY_DRAFT: Record<SocialNetwork, string> = {
  instagram: '',
  tiktok: '',
  x: '',
  youtube: '',
  facebook: '',
};

const PLACEHOLDERS: Record<SocialNetwork, string> = {
  instagram: '@seuinstagram ou instagram.com/seuinstagram',
  tiktok: '@seutiktok ou tiktok.com/@seutiktok',
  x: '@seux ou x.com/seux',
  youtube: '@seucanal ou youtube.com/@seucanal',
  facebook: '@suapagina ou facebook.com/suapagina',
};

function draftFromLinks(links: SocialLinks | null | undefined): Record<SocialNetwork, string> {
  const draft = { ...EMPTY_DRAFT };
  for (const id of SOCIAL_NETWORKS) draft[id] = links?.[id] ?? '';
  return draft;
}

/**
 * Configuração → "Redes sociais": 5 campos (Instagram, TikTok, X, YouTube,
 * Facebook) com validação instantânea e preview do link canônico. Salva via
 * PATCH só de `socialLinks` (o backend normaliza e grava); o perfil público
 * (cabeçalho e aba Sobre) renderiza o que estiver preenchido.
 */
export const SocialLinksSection: React.FC<{
  initialLinks?: SocialLinks | null;
  onNotify: (message: string, type: 'success' | 'error') => void;
}> = ({ initialLinks, onNotify }) => {
  const { setSocialLinks } = useBarbershop();
  const [draft, setDraft] = useState<Record<SocialNetwork, string>>(() => draftFromLinks(initialLinks));
  const [saving, setSaving] = useState(false);

  const previewFor = (id: SocialNetwork) => {
    const value = draft[id].trim();
    if (!value) return null;
    return normalizeSocialLink(id, value);
  };

  const hasInvalid = SOCIAL_NETWORKS.some(id => {
    const preview = previewFor(id);
    return preview !== null && !preview.ok;
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      for (const id of SOCIAL_NETWORKS) payload[id] = draft[id].trim();
      const saved = await setSocialLinks(payload as SocialLinks);
      setDraft(draftFromLinks(saved));
      onNotify('Redes sociais salvas.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível salvar as redes sociais.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Redes sociais</h3>
      <p className="text-xs text-text-muted mb-4">
        Os ícones aparecem no seu perfil público para os clientes. Pode informar só o usuário
        (ex.: <span className="font-medium">@seuusuario</span>) ou o link completo — nós
        normalizamos. Deixe em branco para remover a rede.
      </p>

      <div className="space-y-4">
        {SOCIAL_NETWORKS.map(id => {
          const def = SOCIAL_NETWORK_DEFS[id];
          const value = draft[id];
          const preview = previewFor(id);
          const invalid = preview !== null && preview.ok === false;
          const previewError = preview !== null && preview.ok === false ? preview.error : null;
          return (
            <div key={id}>
              <label
                htmlFor={`social-link-${id}`}
                className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-secondary"
              >
                <SocialNetworkIcon network={id} size={14} />
                {def.label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={`social-link-${id}`}
                  type="text"
                  value={value}
                  onChange={e => setDraft(prev => ({ ...prev, [id]: e.target.value }))}
                  className={invalid ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
                  placeholder={PLACEHOLDERS[id]}
                  disabled={saving}
                  autoComplete="off"
                  spellCheck={false}
                />
                {value && (
                  <button
                    type="button"
                    onClick={() => setDraft(prev => ({ ...prev, [id]: '' }))}
                    disabled={saving}
                    className="shrink-0 min-h-11 px-3 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
                    aria-label={`Limpar link do ${def.label}`}
                  >
                    Limpar
                  </button>
                )}
              </div>
              {preview?.ok && (
                <p className="mt-1 text-[11px] text-success truncate" data-testid={`social-preview-${id}`}>
                  {preview.url}
                </p>
              )}
              {previewError && (
                <p className="mt-1 text-xs text-danger" role="alert">
                  {previewError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving || hasInvalid}
          className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-accent-fg text-sm font-bold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};
