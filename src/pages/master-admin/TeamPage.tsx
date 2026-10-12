import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LuLoader, LuTriangleAlert, LuMail, LuShield, LuShieldOff, LuRefreshCcw, LuSend, LuX
} from 'react-icons/lu';
import { adminInternalApi, TeamMember, Invitation, InternalProfile } from '../../infra/adminInternalApi';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';

const INVITE_PROFILES = ['ADMIN', 'SUPPORT', 'FINANCE', 'COMMERCIAL', 'READ_ONLY'] as const;

export const inviteFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail.')
    .email('Informe um e-mail válido.'),
  profile: z.enum(INVITE_PROFILES),
});

export type InviteFormData = z.infer<typeof inviteFormSchema>;

const profileOptions: { value: InternalProfile; label: string; hint: string }[] = [
  { value: 'ADMIN', label: 'Admin', hint: 'Acesso total' },
  { value: 'SUPPORT', label: 'Suporte', hint: 'Chamados e operação' },
  { value: 'FINANCE', label: 'Financeiro', hint: 'Receita e indicações' },
  { value: 'COMMERCIAL', label: 'Comercial', hint: 'Salões e indicações' },
  { value: 'READ_ONLY', label: 'Leitura', hint: 'Consulta geral' },
];

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'bot' } | null>(null);
  const [confirm, setConfirm] = useState<{ type: 'deactivate' | 'reactivate' | 'revoke'; id: string; name?: string } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', profile: 'ADMIN' },
  });
  const inviteProfile = watch('profile');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminInternalApi.listTeam({ search });
      setMembers(res.users);
      setInvitations(res.invitations);
    } catch {
      setError('Não foi possível carregar a equipe.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { void load(); }, [load]);

  const handleInvite = async (data: InviteFormData) => {
    try {
      await adminInternalApi.inviteTeamMember(data.email, data.profile);
      reset({ email: '', profile: 'ADMIN' });
      load();
      setToast({ message: 'Convite enviado.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Erro ao enviar convite.', type: 'error' });
    }
  };

  const handleDeactivate = async (id: string) => {
    setConfirmLoading(true);
    try {
      await adminInternalApi.deactivateMember(id);
      load();
      setToast({ message: 'Membro desativado.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Erro ao desativar.', type: 'error' });
    } finally {
      setConfirmLoading(false);
      setConfirm(null);
    }
  };

  const handleReactivate = async (id: string) => {
    setConfirmLoading(true);
    try {
      await adminInternalApi.reactivateMember(id);
      load();
      setToast({ message: 'Membro reativado.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Erro ao reativar.', type: 'error' });
    } finally {
      setConfirmLoading(false);
      setConfirm(null);
    }
  };

  const handleResend = async (id: string) => {
    try {
      await adminInternalApi.resendInvitation(id);
      load();
      setToast({ message: 'Convite reenviado.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Erro ao reenviar.', type: 'error' });
    }
  };

  const handleRevoke = async (id: string) => {
    setConfirmLoading(true);
    try {
      await adminInternalApi.revokeInvitation(id);
      load();
      setToast({ message: 'Convite revogado.', type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message ?? 'Erro ao revogar.', type: 'error' });
    } finally {
      setConfirmLoading(false);
      setConfirm(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LuLoader className="animate-spin text-accent" size={32} /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <LuTriangleAlert className="mx-auto mb-2 text-warning" size={24} />
        <p className="text-sm text-text-secondary">{error}</p>
        <button onClick={load} className="text-accent text-sm mt-2 hover:underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Equipe Agenda Já</h1>
        <button onClick={load} title="Atualizar" className="p-2 rounded-lg hover:bg-surface-2 text-text-muted"><LuRefreshCcw size={16} /></button>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-text-muted mb-2">
          Buscar na equipe
        </label>
        <input
          type="search"
          placeholder="Nome ou e-mail"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
        />
      </div>

      {/* Invite form */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-bold mb-3">Convidar funcionário interno</h2>
        <form onSubmit={handleSubmit(handleInvite)} noValidate className="grid gap-3">
          <Field label="E-mail do convidado" error={errors.email?.message}>
            <input
              type="email"
              autoComplete="off"
              placeholder="E-mail do convidado"
              className={errors.email ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
              {...register('email')}
            />
          </Field>
          <div className="grid gap-2 sm:grid-cols-5" role="group" aria-label="Perfil do convidado">
            {profileOptions.map((profile) => (
              <button
                key={profile.value}
                type="button"
                aria-pressed={inviteProfile === profile.value}
                onClick={() => setValue('profile', profile.value, { shouldValidate: true })}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  inviteProfile === profile.value
                    ? 'border-accent bg-accent/10 text-text-primary'
                    : 'border-border bg-bg text-text-secondary hover:border-text-muted'
                }`}
              >
                <span className="block text-xs font-bold">{profile.label}</span>
                <span className="block text-[11px] text-text-muted">{profile.hint}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting} className="flex items-center gap-2">
              <LuSend size={14} /> Enviar convite
            </Button>
          </div>
        </form>
      </div>

      {/* Members */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold">Membros ({members.length})</h2>
        </div>
        <div className="divide-y divide-border/50">
          {members.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">Nenhum membro encontrado.</p>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-xs text-text-muted truncate">{m.email}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                  <span>{m._count.ticketsAssigned} chamados</span>
                  <span>{m._count.tasksAssigned} tarefas</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${m.active ? 'text-success bg-success/10' : 'text-danger bg-danger/10'}`}>
                  {m.active ? 'Ativo' : 'Inativo'}
                </div>
                {m.active ? (
                  <button
                    onClick={() => setConfirm({ type: 'deactivate', id: m.id, name: m.name })}
                    className="p-1.5 rounded hover:bg-danger/10 text-danger"
                    title="Desativar"
                  >
                    <LuShieldOff size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirm({ type: 'reactivate', id: m.id, name: m.name })}
                    className="p-1.5 rounded hover:bg-success/10 text-success"
                    title="Reativar"
                  >
                    <LuShield size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-bold">Convites pendentes ({invitations.length})</h2>
          </div>
          <div className="divide-y divide-border/50">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 px-4 py-3">
                <LuMail size={16} className="text-text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inv.email}</p>
                  <p className="text-xs text-text-muted">
                    Enviado por {inv.invitedBy.name} em {new Date(inv.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleResend(inv.id)} className="p-1.5 rounded hover:bg-surface-2" title="Reenviar">
                    <LuRefreshCcw size={14} className="text-text-muted" />
                  </button>
                  <button onClick={() => setConfirm({ type: 'revoke', id: inv.id })} className="p-1.5 rounded hover:bg-danger/10" title="Revogar">
                    <LuX size={14} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirm?.type === 'deactivate'}
        title="Desativar membro"
        message={`Desativar ${confirm?.name ?? ''}? Esta ação revoga o acesso imediatamente.`}
        confirmLabel="Desativar"
        variant="danger"
        loading={confirmLoading}
        onConfirm={() => confirm && void handleDeactivate(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'reactivate'}
        title="Reativar membro"
        message={`Reativar ${confirm?.name ?? ''}? O usuário poderá acessar novamente com a conta dele.`}
        confirmLabel="Reativar"
        loading={confirmLoading}
        onConfirm={() => confirm && void handleReactivate(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === 'revoke'}
        title="Revogar convite"
        message="Revogar este convite?"
        confirmLabel="Revogar"
        variant="danger"
        loading={confirmLoading}
        onConfirm={() => confirm && void handleRevoke(confirm.id)}
        onCancel={() => setConfirm(null)}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeamPage;
