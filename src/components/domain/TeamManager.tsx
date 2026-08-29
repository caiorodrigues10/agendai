import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffMember, EmployeePermission } from '../../types';
import { TeamMemberSchema, TeamMemberFormData } from '../../schemas';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, UserPlus, X, Check, AlertCircle, Camera, Loader2, ChevronDown, Shield } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { usersApi } from '../../infra/usersApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { ALL_PERMISSIONS, PERMISSION_LABELS } from '../../hooks/usePermissions';

interface TeamManagerProps {
  staff: StaffMember[];
  onUpdateTeam: (newTeam: StaffMember[]) => Promise<void> | void;
  currentAdminId: string;
}

export const TeamManager: React.FC<TeamManagerProps> = ({
  staff,
  onUpdateTeam,
  currentAdminId,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [avatarUploadingId, setAvatarUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarTargetId, setAvatarTargetId] = useState<string | null>(null);
  const [editingPermissionsId, setEditingPermissionsId] = useState<string | null>(null);
  const [permissionsSaving, setPermissionsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamMemberFormData>({
    resolver: zodResolver(TeamMemberSchema),
  });

  const handleAddMember = async (data: TeamMemberFormData) => {
    setSaving(true);
    setFormError(null);
    const newMember: StaffMember & { cpf: string; password: string } = {
      id: uuidv4(),
      name: data.name,
      email: data.email,
      password: data.password,
      cpf: data.cpf,
      role: 'EMPLOYEE',
      permissions: ['QUEUE_MANAGE', 'APPOINTMENTS_MANAGE', 'CLIENTS_MANAGE', 'PACKAGES_SELL'],
    };

    try {
      await onUpdateTeam([...staff, newMember]);
      reset();
      setIsAdding(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível cadastrar o funcionário';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    setFormError(null);
    try {
      await onUpdateTeam(staff.filter(m => m.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível remover o membro';
      setFormError(message);
    }
  };

  const handleAvatarClick = (memberId: string) => {
    setAvatarTargetId(memberId);
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !avatarTargetId) return;

    setAvatarUploadingId(avatarTargetId);
    try {
      const { uploadUrl, publicUrl } = await usersApi.getAvatarUploadUrl(avatarTargetId, file.type);
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!putRes.ok) throw new Error('Falha ao enviar arquivo');
      await usersApi.confirmAvatar(avatarTargetId, publicUrl);
      const updated = staff.map(m => (m.id === avatarTargetId ? { ...m, avatarUrl: publicUrl } : m));
      await onUpdateTeam(updated);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Erro ao enviar foto'));
    } finally {
      setAvatarUploadingId(null);
      setAvatarTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTogglePermission = async (memberId: string, perm: EmployeePermission) => {
    setPermissionsSaving(true);
    try {
      const member = staff.find(m => m.id === memberId);
      if (!member) return;
      const current = member.permissions ?? [];
      const updated = current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm];
      const newTeam = staff.map(m => (m.id === memberId ? { ...m, permissions: updated } : m));
      await onUpdateTeam(newTeam);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Erro ao atualizar permissões'));
    } finally {
      setPermissionsSaving(false);
    }
  };

  return (
    <div className="mt-6 animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-text-primary">Equipe & Acessos</h3>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setFormError(null);
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-accent/50 bg-accent/10 px-3 py-2 text-xs font-bold text-accent transition-all hover:bg-accent-hover hover:text-black"
        >
          <UserPlus size={14} /> Adicionar
        </button>
      </div>

      {formError && !isAdding && (
        <div className="mb-3 flex items-center gap-1 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
          <AlertCircle size={12} /> {formError}
        </div>
      )}

      {isAdding && (
        <form
          onSubmit={handleSubmit(handleAddMember)}
          autoComplete="off"
          className="mb-4 rounded-xl border border-border bg-surface p-4 animate-fade-in-down"
        >
          <h4 className="mb-3 text-sm font-bold text-text-primary">Novo Membro</h4>
          {formError && (
            <div className="mb-3 flex items-center gap-1 rounded-lg border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger">
              <AlertCircle size={12} /> {formError}
            </div>
          )}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome (ex: Carlos)"
              className={`w-full rounded border px-3 py-3 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent ${errors.name ? 'border-danger' : 'border-border bg-bg'}`}
              {...register('name')}
            />
            <input
              type="email"
              placeholder="E-mail"
              autoComplete="off"
              className={`w-full rounded border px-3 py-3 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent ${errors.email ? 'border-danger' : 'border-border bg-bg'}`}
              {...register('email')}
            />
            <input
              type="text"
              placeholder="CPF (somente números)"
              className={`w-full rounded border px-3 py-3 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent ${errors.cpf ? 'border-danger' : 'border-border bg-bg'}`}
              {...register('cpf')}
            />
            <input
              type="password"
              placeholder="Senha"
              autoComplete="new-password"
              className={`w-full rounded border px-3 py-3 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent ${errors.password ? 'border-danger' : 'border-border bg-bg'}`}
              {...register('password')}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="min-h-11 flex-1 rounded bg-surface-2 py-2 text-xs text-text-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-11 flex-1 rounded bg-accent py-2 text-xs font-bold text-accent-fg disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {staff.map(member => {
          const isEmployee = member.role === 'EMPLOYEE';
          const isExpanded = editingPermissionsId === member.id;
          const memberPerms = member.permissions ?? [];

          return (
            <div key={member.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <div className="flex items-start justify-between gap-3 p-3 sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="relative cursor-pointer group"
                    onClick={() => handleAvatarClick(member.id)}
                  >
                    <Avatar src={member.avatarUrl} name={member.name} size="sm" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {avatarUploadingId === member.id ? (
                        <Loader2 size={14} className="animate-spin text-white" />
                      ) : (
                        <Camera size={14} className="text-white" />
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-medium text-text-primary">
                      {member.name} {member.id === currentAdminId && '(Você)'}
                    </h4>
                    <p className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
                      <span className="truncate">{member.email}</span>
                      <span className="rounded border border-border bg-bg px-1 uppercase text-[0.6rem]">
                        {member.role === 'MASTER_ADMIN'
                          ? 'Admin'
                          : member.role === 'OWNER'
                            ? 'Dono'
                            : 'Funcionário'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isEmployee && member.id !== currentAdminId && (
                    <>
                      <button
                        onClick={() => setEditingPermissionsId(isExpanded ? null : member.id)}
                        className={`rounded-lg p-2 transition-colors min-h-10 min-w-10 ${isExpanded ? 'bg-accent/10 text-accent' : 'text-text-muted hover:bg-accent/10 hover:text-accent'}`}
                        title="Gerenciar permissões"
                      >
                        <Shield size={16} />
                      </button>
                      {deleteConfirmId === member.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => confirmDelete(member.id)}
                            className="rounded bg-danger p-1.5 text-white"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded bg-surface-2 p-1.5 text-text-secondary"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(member.id)}
                          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger min-h-10 min-w-10"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                  {isEmployee && member.id === currentAdminId && (
                    <span className="px-2 text-[10px] text-text-muted">Você</span>
                  )}
                  {!isEmployee && <ChevronDown size={14} className="text-text-muted" />}
                </div>
              </div>

              {isExpanded && isEmployee && (
                <div className="animate-fade-in-down border-t border-border px-3 pb-3 pt-2">
                  <p className="mb-2 text-[10px] font-bold uppercase text-text-muted">Permissões</p>
                  <div className="grid grid-cols-2 gap-1">
                    {ALL_PERMISSIONS.map(perm => (
                      <label
                        key={perm}
                        className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
                          memberPerms.includes(perm)
                            ? 'bg-accent/10 text-accent'
                            : 'text-text-muted hover:bg-surface-2'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={memberPerms.includes(perm)}
                          disabled={permissionsSaving}
                          onChange={() => handleTogglePermission(member.id, perm)}
                          className="sr-only"
                        />
                        <div
                          className={`flex h-3 w-3 flex-shrink-0 items-center justify-center rounded border ${memberPerms.includes(perm) ? 'border-accent bg-accent' : 'border-border'}`}
                        >
                          {memberPerms.includes(perm) && <Check size={10} className="text-accent-fg" />}
                        </div>
                        <span className="leading-tight">{PERMISSION_LABELS[perm]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {staff.length === 0 && (
          <p className="py-4 text-center text-sm text-text-muted">Nenhum membro na equipe.</p>
        )}
      </div>
    </div>
  );
};
