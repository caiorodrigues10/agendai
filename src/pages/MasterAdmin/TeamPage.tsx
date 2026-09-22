import React, { useState, useEffect, useCallback } from 'react';
import {
  LuLoader, LuTriangleAlert, LuMail, LuShield, LuShieldOff, LuRefreshCcw, LuSend, LuX
} from 'react-icons/lu';
import { adminInternalApi, TeamMember, Invitation } from '../../infra/adminInternalApi';

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [search, setSearch] = useState('');

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

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await adminInternalApi.inviteTeamMember(inviteEmail.trim());
      setInviteEmail('');
      load();
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao enviar convite.');
    } finally {
      setInviting(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Desativar ${name}? Esta ação revoga o acesso imediatamente.`)) return;
    try {
      await adminInternalApi.deactivateMember(id);
      load();
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao desativar.');
    }
  };

  const handleResend = async (id: string) => {
    try {
      await adminInternalApi.resendInvitation(id);
      load();
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao reenviar.');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revogar este convite?')) return;
    try {
      await adminInternalApi.revokeInvitation(id);
      load();
    } catch (err: any) {
      alert(err?.message ?? 'Erro ao revogar.');
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
        <h1 className="text-xl font-bold">Equipe AgendAI</h1>
        <button onClick={load} className="p-2 rounded-lg hover:bg-surface-2 text-text-muted"><LuRefreshCcw size={16} /></button>
      </div>

      {/* Invite form */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <h2 className="text-sm font-bold mb-3">Convidar administrador</h2>
        <div className="flex gap-2">
          <input
            type="email" placeholder="E-mail do convidado" value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-accent-hover"
          >
            <LuSend size={14} /> Enviar convite
          </button>
        </div>
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
                {m.active && (
                  <button
                    onClick={() => handleDeactivate(m.id, m.name)}
                    className="p-1.5 rounded hover:bg-danger/10 text-danger"
                    title="Desativar"
                  >
                    <LuShieldOff size={14} />
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
                  <button onClick={() => handleRevoke(inv.id)} className="p-1.5 rounded hover:bg-danger/10" title="Revogar">
                    <LuX size={14} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
