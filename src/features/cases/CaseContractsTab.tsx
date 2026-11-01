import React, { useState } from 'react';
import { LuCheck as Check, LuPlus as Plus, LuSend as Send } from 'react-icons/lu';
import {
  casesApi,
  type CaseContract,
  type ContractSignature,
  type ContractStatus,
  type ContractType,
} from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { formatDate } from './caseLabels';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  ENGAGEMENT: 'Contrato de serviços',
  PROCURACAO: 'Procuração',
  SETTLEMENT: 'Acordo',
  FEE_AGREEMENT: 'Contrato de honorários',
  OTHER: 'Outro',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado para assinatura',
  PARTIALLY_SIGNED: 'Parcialmente assinado',
  SIGNED: 'Assinado',
  VOID: 'Anulado',
};

export interface CaseContractsTabProps {
  caseId: string;
  contracts: CaseContract[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

/**
 * Contratos e procurações do processo.
 *
 * O documento é interno do escritório; a assinatura acontece numa página
 * pública por link (token). O painel mostra quem já assinou e compartilha o
 * link com quem falta.
 */
export const CaseContractsTab: React.FC<CaseContractsTabProps> = ({
  caseId,
  contracts,
  onChanged,
  onNotify,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ContractType>('ENGAGEMENT');
  const [signerName, setSignerName] = useState('');
  const [signerWhatsapp, setSignerWhatsapp] = useState('');
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState<Record<string, string[]>>({});

  const createContract = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await casesApi.createContract(caseId, {
        title: title.trim(),
        type,
        signers: signerName.trim()
          ? [
              {
                signerName: signerName.trim(),
                signerWhatsapp: signerWhatsapp.trim() || null,
                role: 'CLIENT',
              },
            ]
          : undefined,
      });
      setTitle('');
      setSignerName('');
      setSignerWhatsapp('');
      await onChanged();
      onNotify?.('Contrato criado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const addSigner = async (contract: CaseContract) => {
    const name = window.prompt('Nome do signatário');
    if (!name?.trim()) return;
    const whatsapp = window.prompt('WhatsApp do signatário (opcional)') || '';
    try {
      await casesApi.addContractSigner(contract.id, {
        signerName: name.trim(),
        signerWhatsapp: whatsapp.trim() || null,
        role: 'CLIENT',
      });
      await onChanged();
      onNotify?.('Signatário adicionado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  const sendForSignature = async (contract: CaseContract) => {
    try {
      const result = await casesApi.sendContractForSignature(contract.id);
      setLinks(prev => ({
        ...prev,
        [contract.id]: result.links.map(link => `${link.signerName}: ${link.url}`),
      }));
      await onChanged();
      onNotify?.('Link de assinatura enviado.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={createContract} className="flex flex-wrap items-end gap-2">
        <label className="min-w-[12rem] flex-1 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Novo contrato/procuração
          </span>
          <input
            className={FIELD_CONTROL}
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Ex.: Contrato de honorários"
            aria-label="Título do contrato"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Tipo</span>
          <select
            className={FIELD_CONTROL}
            value={type}
            onChange={event => setType(event.target.value as ContractType)}
            aria-label="Tipo do contrato"
          >
            {(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map(option => (
              <option key={option} value={option}>
                {CONTRACT_TYPE_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Signatário (opcional)
          </span>
          <input
            className={FIELD_CONTROL}
            value={signerName}
            onChange={event => setSignerName(event.target.value)}
            placeholder="Nome"
            aria-label="Nome do signatário"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            WhatsApp (opcional)
          </span>
          <input
            className={FIELD_CONTROL}
            value={signerWhatsapp}
            onChange={event => setSignerWhatsapp(event.target.value)}
            placeholder="5511999999999"
            aria-label="WhatsApp do signatário"
          />
        </label>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
        >
          <Plus size={14} /> Criar
        </button>
      </form>

      {contracts.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhum contrato registrado neste processo.
        </p>
      ) : (
        <ul className="space-y-2">
          {contracts.map(contract => (
            <li
              key={contract.id}
              className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-text-primary">{contract.title}</p>
                  <p className="text-text-muted">
                    {CONTRACT_TYPE_LABELS[contract.type]} · {CONTRACT_STATUS_LABELS[contract.status]}
                    {contract.signedAt ? ` · assinado em ${formatDate(contract.signedAt)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void addSigner(contract)}
                    className="rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary"
                  >
                    <Plus size={12} /> Signatário
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendForSignature(contract)}
                    disabled={contract.status === 'SIGNED'}
                    className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-text-secondary hover:text-text-primary disabled:opacity-50"
                  >
                    <Send size={12} /> Enviar
                  </button>
                </div>
              </div>

              {contract.signatures.length > 0 && (
                <ul className="mt-2 space-y-1 border-t border-border pt-2">
                  {contract.signatures.map(signature => (
                    <SignatureRow key={signature.id} signature={signature} />
                  ))}
                </ul>
              )}

              {links[contract.id]?.length ? (
                <ul className="mt-2 space-y-1 rounded-lg bg-surface-2 px-2 py-1.5">
                  {links[contract.id].map(link => (
                    <li key={link} className="break-all text-[11px] text-text-secondary">
                      {link}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const SignatureRow: React.FC<{ signature: ContractSignature }> = ({ signature }) => (
  <li className="flex items-center justify-between gap-2 text-[11px]">
    <span className="text-text-secondary">
      {signature.signerName}
      {signature.signerWhatsapp ? ` · ${signature.signerWhatsapp}` : ''}
    </span>
    <span
      className={
        signature.status === 'SIGNED'
          ? 'font-bold text-success'
          : signature.status === 'DECLINED'
            ? 'font-bold text-danger'
            : 'text-text-muted'
      }
    >
      {signature.status === 'SIGNED' ? (
        <span className="flex items-center gap-1">
          <Check size={12} /> Assinado {signature.signedAt ? formatDate(signature.signedAt) : ''}
        </span>
      ) : signature.status === 'DECLINED' ? (
        'Recusado'
      ) : (
        'Aguardando'
      )}
    </span>
  </li>
);
