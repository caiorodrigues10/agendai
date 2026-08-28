import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StaffMember } from '../../types';
import { TeamMemberSchema, TeamMemberFormData } from '../../schemas';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, UserPlus, X, Check, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { usersApi } from '../../infra/usersApi';
import { getErrorMessage } from '../../utils/errorMessage';

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
    };

    try {
      await onUpdateTeam([...staff, newMember]);
      reset();
      setIsAdding(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível cadastrar o funcionário';
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
      const updated = staff.map(m =>
        m.id === avatarTargetId ? { ...m, avatarUrl: publicUrl } : m
      );
      await onUpdateTeam(updated);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Erro ao enviar foto'));
    } finally {
      setAvatarUploadingId(null);
      setAvatarTargetId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-text-primary">Equipe & Acessos</h3>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setFormError(null);
          }}
          className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/50 rounded-lg text-xs font-bold hover:bg-accent-hover hover:text-black transition-all flex items-center gap-1"
        >
          <UserPlus size={14} /> Adicionar
        </button>
      </div>

      {formError && !isAdding && (
        <div className="mb-3 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 flex items-center gap-1">
          <AlertCircle size={12} /> {formError}
        </div>
      )}

      {isAdding && (
        <form
          onSubmit={handleSubmit(handleAddMember)}
          autoComplete="off"
          className="bg-surface p-4 rounded-xl border border-border mb-4 animate-fade-in-down"
        >
          <h4 className="text-sm font-bold text-text-primary mb-3">Novo Membro</h4>
          {formError && (
            <div className="mb-3 text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2 flex items-center gap-1">
              <AlertCircle size={12} /> {formError}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Nome (ex: Carlos)"
                className={`w-full bg-bg border rounded px-3 py-2 text-text-primary text-sm focus:ring-1 focus:ring-accent outline-none ${errors.name ? 'border-danger' : 'border-border'}`}
                {...register('name')}
              />
              {errors.name && (
                <span className="text-danger text-[10px] flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="E-mail"
                autoComplete="off"
                className={`w-full bg-bg border rounded px-3 py-2 text-text-primary text-sm focus:ring-1 focus:ring-accent outline-none ${errors.email ? 'border-danger' : 'border-border'}`}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-danger text-[10px] flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="CPF (somente números)"
                className={`w-full bg-bg border rounded px-3 py-2 text-text-primary text-sm focus:ring-1 focus:ring-accent outline-none ${errors.cpf ? 'border-danger' : 'border-border'}`}
                {...register('cpf')}
              />
              {errors.cpf && (
                <span className="text-danger text-[10px] flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.cpf.message}
                </span>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Senha"
                autoComplete="new-password"
                className={`w-full bg-bg border rounded px-3 py-2 text-text-primary text-sm focus:ring-1 focus:ring-accent outline-none ${errors.password ? 'border-danger' : 'border-border'}`}
                {...register('password')}
              />
              {errors.password && (
                <span className="text-danger text-[10px] flex items-center gap-1 mt-1">
                  <AlertCircle size={10} /> {errors.password.message}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 text-xs text-text-secondary bg-surface-2 rounded hover:bg-border-strong"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 text-xs text-accent-fg font-bold bg-accent rounded hover:bg-accent-hover disabled:opacity-60"
              >
                {saving ? 'Salvando…' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {staff.map(member => (
          <div
            key={member.id}
            className="bg-surface p-3 rounded-lg border border-border flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => handleAvatarClick(member.id)}>
                <Avatar src={member.avatarUrl} name={member.name} size="sm" />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {avatarUploadingId === member.id ? (
                    <Loader2 size={14} className="text-white animate-spin" />
                  ) : (
                    <Camera size={14} className="text-white" />
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-text-primary">
                  {member.name} {member.id === currentAdminId && '(Você)'}
                </h4>
                <p className="text-xs text-text-muted flex items-center gap-1">
                  {member.email}{' '}
                  <span className="uppercase text-[0.6rem] border border-border px-1 rounded bg-bg">
                    {member.role === 'MASTER_ADMIN'
                      ? 'Admin'
                      : member.role === 'OWNER'
                        ? 'Dono'
                        : 'Funcionário'}
                  </span>
                </p>
              </div>
            </div>

            {member.id !== currentAdminId &&
              member.role === 'EMPLOYEE' &&
              (deleteConfirmId === member.id ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-[10px] text-danger font-bold">Excluir?</span>
                  <button
                    onClick={() => confirmDelete(member.id)}
                    className="p-1.5 bg-danger text-white rounded hover:bg-danger/80"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="p-1.5 bg-surface-2 text-text-secondary rounded hover:bg-border-strong"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirmId(member.id)}
                  className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              ))}
          </div>
        ))}
        {staff.length === 0 && (
          <p className="text-center text-text-muted text-sm py-4">Nenhum membro na equipe.</p>
        )}
      </div>
    </div>
  );
};
