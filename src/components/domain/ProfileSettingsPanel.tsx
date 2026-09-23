import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  LuKeyRound as KeyRound,
  LuLoaderCircle as Loader2,
  LuSave as Save,
  LuUserRound as UserRound,
} from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_GRID } from '../ui/Field';
import { ProfileSettingsSchema, ProfileSettingsFormData } from '../../schemas';

export const ProfileSettingsPanel: React.FC<{ onNotify: (message: string, type: 'success' | 'error') => void }> = ({ onNotify }) => {
  const { user, updateUserProfile } = useAuth();
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(ProfileSettingsSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      currentPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = async (data: ProfileSettingsFormData) => {
    setSaving(true);
    try {
      await updateUserProfile({
        name: data.name.trim(),
        email: data.email.trim(),
        currentPassword: data.currentPassword || undefined,
        newPassword: data.newPassword || undefined,
      });
      onNotify('Perfil atualizado com sucesso.', 'success');
    } catch (error) {
      onNotify(getErrorMessage(error, 'Não foi possível atualizar o perfil.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <UserRound size={18} /> Dados da conta
        </h3>
        <p className="mt-1 text-sm text-text-secondary">Atualize seus dados de acesso e sua senha.</p>
      </div>
      <div className={FORM_GRID}>
        <Field label="Nome" error={errors.name?.message}>
          <input
            className={errors.name ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
            {...register('name')}
          />
        </Field>
        <Field label="E-mail" error={errors.email?.message}>
          <input
            type="email"
            className={errors.email ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
            {...register('email')}
          />
        </Field>
      </div>
      <div className="border-t border-border pt-4">
        <p className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <KeyRound size={16} /> Alterar senha
        </p>
        <div className={`${FORM_GRID} mt-3`}>
          <Field label="Senha atual" error={errors.currentPassword?.message}>
            <input
              type="password"
              placeholder="Sua senha atual"
              className={errors.currentPassword ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
              autoComplete="current-password"
              {...register('currentPassword')}
            />
          </Field>
          <Field label="Nova senha" error={errors.newPassword?.message}>
            <input
              type="password"
              placeholder="Opcional"
              className={errors.newPassword ? FIELD_CONTROL_ERROR : FIELD_CONTROL}
              autoComplete="new-password"
              {...register('newPassword')}
            />
          </Field>
        </div>
      </div>
      <button disabled={saving} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent font-bold text-accent-fg disabled:opacity-60">
        <Save size={16} />
        {saving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar dados da conta'}
      </button>
    </form>
  );
};
