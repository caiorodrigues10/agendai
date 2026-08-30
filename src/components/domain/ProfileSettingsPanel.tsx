import React, { useState } from 'react';
import { KeyRound, Loader2, Save, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';

export const ProfileSettingsPanel: React.FC<{ onNotify: (message: string, type: 'success' | 'error') => void }> = ({ onNotify }) => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword && !currentPassword) { onNotify('Informe sua senha atual para criar uma nova.', 'error'); return; }
    setSaving(true);
    try {
      await updateUserProfile({ name: name.trim(), email: email.trim(), currentPassword: currentPassword || undefined, newPassword: newPassword || undefined });
      setCurrentPassword(''); setNewPassword('');
      onNotify('Perfil atualizado com sucesso.', 'success');
    } catch (error) { onNotify(getErrorMessage(error, 'Não foi possível atualizar o perfil.'), 'error'); }
    finally { setSaving(false); }
  };

  return <form onSubmit={submit} className="bg-surface border border-border rounded-xl p-5 space-y-4">
    <div><h3 className="text-lg font-bold text-text-primary">Dados da conta</h3><p className="text-sm text-text-secondary mt-1">Atualize seus dados de acesso e sua senha.</p></div>
    <label className="block text-sm text-text-secondary">Nome<input value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary" required minLength={3} /></label>
    <label className="block text-sm text-text-secondary">E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary" required /></label>
    <div className="border-t border-border pt-4"><p className="flex items-center gap-2 text-sm font-bold text-text-primary"><KeyRound size={16} /> Alterar senha</p><div className="grid gap-3 sm:grid-cols-2 mt-3"><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Senha atual" className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary" autoComplete="current-password" /><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha (opcional)" className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-text-primary" autoComplete="new-password" minLength={6} /></div></div>
    <button disabled={saving} className="w-full min-h-11 rounded-xl bg-accent text-accent-fg font-bold flex items-center justify-center gap-2 disabled:opacity-60"><Save size={16} />{saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar dados da conta'}</button>
  </form>;
};
