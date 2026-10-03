import { useEffect, useState } from 'react';
import { barbershopApi } from '../../infra/barbershopApi';
import { socialApi } from '../../infra/socialApi';
import { SmartSelect, type SelectOption } from '../../components/ui/SmartSelect';
import { getErrorMessage } from '../../utils/errorMessage';

export function PostTagEditor({ salonId, postId }: { salonId: string; postId: string }) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [target, setTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    void barbershopApi
      .listBarbershops()
      .then(shops => {
        if (active)
          setOptions(
            shops
              .filter(shop => shop.id && shop.id !== salonId && shop.active !== false)
              .map(shop => ({
                value: shop.id!,
                label: shop.name || 'Salão',
                description: shop.city || undefined,
              }))
          );
      })
      .catch(err => {
        if (active) setError(getErrorMessage(err, 'Não foi possível buscar salões.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [salonId]);
  const send = async () => {
    if (!target || sending) return;
    setSending(true);
    setError('');
    setMessage('');
    try {
      await socialApi.requestTag(salonId, postId, target);
      setMessage('Marcação enviada. Ela aparecerá no perfil após aprovação do salão marcado.');
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível solicitar a marcação.'));
    } finally {
      setSending(false);
    }
  };
  return (
    <section className="border-t border-border p-4 space-y-3">
      <h3 className="text-sm font-bold">Marcar outro salão</h3>
      <SmartSelect
        label="Salão marcado"
        value={target}
        onChange={setTarget}
        options={options}
        searchable
        loading={loading}
        disabled={sending}
        placeholder="Buscar salão…"
      />
      <button
        type="button"
        disabled={!target || sending}
        onClick={() => void send()}
        className="min-h-11 rounded-xl border border-border px-4 text-xs font-bold disabled:opacity-50"
      >
        {sending ? 'Enviando…' : 'Solicitar marcação'}
      </button>
      {message && (
        <p role="status" className="text-xs text-success">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
