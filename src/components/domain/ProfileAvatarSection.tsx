import React, { useRef, useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { usersApi } from '../../infra/usersApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Camera, Trash2, Loader2 } from 'lucide-react';

interface ProfileAvatarSectionProps {
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  onAvatarUpdated: (avatarUrl: string | null) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  userId,
  userName,
  avatarUrl,
  onAvatarUpdated,
  onNotify,
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await usersApi.getAvatarUploadUrl(userId, file.type);
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!putRes.ok) throw new Error('Falha ao enviar arquivo');
      await usersApi.confirmAvatar(userId, publicUrl);
      onAvatarUpdated(publicUrl);
      onNotify('Foto de perfil atualizada!', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Erro ao enviar foto'), 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remover foto de perfil?')) return;
    setDeleting(true);
    try {
      await usersApi.deleteAvatar(userId);
      onAvatarUpdated(null);
      onNotify('Foto removida.', 'success');
    } catch (err) {
      onNotify(getErrorMessage(err, 'Erro ao remover foto'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-4">Sua Foto</h3>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar src={avatarUrl} name={userName} size="lg" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            {uploading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </button>
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm text-text-secondary">
            Foto visível para clientes e equipe no painel e na fila.
          </p>
          <div className="flex gap-2">
            <label
              className={`px-3 py-1.5 text-xs font-medium bg-surface-2 text-text-secondary rounded-lg border border-border cursor-pointer hover:bg-border-strong transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {uploading ? 'Enviando...' : 'Escolher foto'}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs font-medium text-danger bg-danger/10 rounded-lg border border-danger/20 hover:bg-danger/20 transition-colors flex items-center gap-1"
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Remover
              </button>
            )}
          </div>
          <p className="text-[11px] text-text-muted">JPEG, PNG ou WebP. Máximo 5 MB.</p>
        </div>
      </div>
    </div>
  );
};
