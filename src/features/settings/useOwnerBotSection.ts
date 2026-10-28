import { ownerBotApi } from '../../infra/ownerBotApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { useOwnerBotData } from './useOwnerBotData';

/** Estado + ações da seção "Assistente no WhatsApp" (vincular/bloquear/preferências). */
export function useOwnerBotSection(
  barbershopId: string,
  onNotify: (message: string, type: 'success' | 'error') => void
) {
  const data = useOwnerBotData(barbershopId);
  const { busy, setBusy, setError, loadStatus, loadPrefs } = data;

  const handleGenerateCode = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await ownerBotApi.createLinkCode(barbershopId);
      data.setCode(result.code);
      data.setCodeExpiresAt(Date.now() + result.expiresInSeconds * 1000);
      data.setNow(Date.now());
      onNotify('Código de vínculo gerado.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível gerar o código.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await ownerBotApi.unlink(barbershopId);
      data.setShowUnlinkModal(false);
      data.setCode(null);
      data.setCodeExpiresAt(null);
      await loadStatus();
      onNotify('Assistente desvinculado.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível desvincular.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleBlock = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await ownerBotApi.updatePreferences(barbershopId, { blocked: true });
      data.setShowBlockModal(false);
      await loadPrefs();
      await loadStatus();
      onNotify('Assistente bloqueado.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível bloquear.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleUnblock = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await ownerBotApi.updatePreferences(barbershopId, { blocked: false });
      await loadPrefs();
      await loadStatus();
      onNotify('Assistente desbloqueado.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível desbloquear.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSavePrefs = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await ownerBotApi.updatePreferences(barbershopId, data.prefsDraft);
      data.setPrefs(updated);
      data.setPrefsDraft({});
      onNotify('Preferências salvas.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Não foi possível salvar as preferências.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    if (!data.code) return;
    void navigator.clipboard?.writeText(`VINCULAR ${data.code}`).then(() => {
      data.setCopied(true);
      window.setTimeout(() => data.setCopied(false), 1800);
    });
  };

  const refreshStatus = () => void loadStatus();

  return {
    ...data,
    refreshStatus,
    handleGenerateCode,
    handleUnlink,
    handleBlock,
    handleUnblock,
    handleSavePrefs,
    handleCopy,
  };
}
