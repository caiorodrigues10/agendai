import React from 'react';
import { Button } from '../../components/ui/Button';
import { ModalShell } from '../../components/patterns/ModalShell';
import {
  LuBot as Bot,
  LuLoaderCircle as Loader2,
  LuRefreshCw as RefreshCw,
} from 'react-icons/lu';
import {
  ActionLogsPanel,
  BlockingSection,
  CapabilitiesList,
  CatalogPanel,
  LinkCodePanel,
  LinkPromptPanel,
  LinkedPanel,
  PreferencesPanel,
  RecentActionsList,
} from './OwnerBotPanels';
import { useOwnerBotSection } from './useOwnerBotSection';

/**
 * Seção "Assistente no WhatsApp".
 *
 * O dono vincula o próprio número (o mesmo cadastrado no estabelecimento) e
 * passa a falar com o assistente pelo WhatsApp da plataforma.
 */
export const OwnerBotSection: React.FC<{
  barbershopId: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}> = ({ barbershopId, onNotify }) => {
  const bot = useOwnerBotSection(barbershopId, onNotify);
  const {
    status,
    loading,
    busy,
    error,
    code,
    copied,
    secondsLeft,
    showUnlinkModal,
    showBlockModal,
    prefs,
    catalog,
    logs,
    mergedPrefs,
    setShowUnlinkModal,
    setShowBlockModal,
    setPrefsDraft,
    refreshStatus,
    handleGenerateCode,
    handleUnlink,
    handleBlock,
    handleUnblock,
    handleSavePrefs,
    handleCopy,
  } = bot;

  return (
    <div className="bg-surface border border-border rounded-xl p-5" data-testid="owner-bot-section">
      <div className="flex items-start justify-between gap-3 mb-1">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Bot size={18} /> Assistente no WhatsApp
        </h3>
        <button
          type="button"
          onClick={refreshStatus}
          className="text-text-muted hover:text-text-primary"
          aria-label="Atualizar estado do assistente"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      <p className="text-xs text-text-muted mb-4">
        Fale com o assistente pelo WhatsApp para ver a agenda, agendar, cancelar, remarcar, fazer
        check-in e encerrar atendimentos — sem sair do aplicativo.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={16} className="animate-spin" /> Consultando o assistente...
        </div>
      ) : (
        <>
          {status?.linked ? (
            <LinkedPanel status={status} busy={busy} onUnlink={() => setShowUnlinkModal(true)} />
          ) : (
            <LinkPromptPanel busy={busy} onGenerate={() => void handleGenerateCode()} />
          )}

          {code && (
            <LinkCodePanel
              code={code}
              secondsLeft={secondsLeft}
              copied={copied}
              onCopy={handleCopy}
            />
          )}

          {status?.highlights?.length ? <CapabilitiesList highlights={status.highlights} /> : null}

          {status?.recentActions?.length ? (
            <RecentActionsList actions={status.recentActions} />
          ) : null}

          {mergedPrefs && (
            <PreferencesPanel
              prefs={mergedPrefs}
              onPatch={setPrefsDraft}
              onSave={() => void handleSavePrefs()}
              disabled={busy}
            />
          )}

          <BlockingSection
            blocked={Boolean(prefs?.blocked)}
            canBlock={Boolean(prefs)}
            busy={busy}
            onBlock={() => setShowBlockModal(true)}
            onUnblock={() => void handleUnblock()}
          />

          {catalog && <CatalogPanel catalog={catalog} />}

          {logs && logs.length > 0 && <ActionLogsPanel logs={logs} />}
        </>
      )}

      {error && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <ModalShell
        open={showUnlinkModal}
        title="Desvincular o assistente?"
        titleId="owner-bot-unlink-title"
        role="alertdialog"
        loading={busy}
        onClose={() => setShowUnlinkModal(false)}
        body={
          <p className="text-sm text-text-secondary">
            O assistente deixa de responder neste número. Você pode vincular de novo quando quiser.
          </p>
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setShowUnlinkModal(false)}
              className="ml-auto"
            >
              Cancelar
            </Button>
            <Button type="button" variant="danger" disabled={busy} onClick={() => void handleUnlink()}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              Desvincular
            </Button>
          </>
        }
      />

      <ModalShell
        open={showBlockModal}
        title="Bloquear o assistente?"
        titleId="owner-bot-block-title"
        role="alertdialog"
        loading={busy}
        onClose={() => setShowBlockModal(false)}
        body={
          <p className="text-sm text-text-secondary">
            O assistente para de responder no WhatsApp. Você pode desbloquear quando quiser.
          </p>
        }
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setShowBlockModal(false)}
              className="ml-auto"
            >
              Cancelar
            </Button>
            <Button type="button" variant="danger" disabled={busy} onClick={() => void handleBlock()}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : null}
              Bloquear
            </Button>
          </>
        }
      />
    </div>
  );
};
