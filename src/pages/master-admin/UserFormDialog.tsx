import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModalShell } from '../../components/patterns/ModalShell';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR, FORM_FOOTER } from '../../components/ui/Field';
import { Button } from '../../components/ui/Button';
import { adminApi, BarbershopListItem, UserListItem } from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';

const ROLES = [
  { value: 'MASTER_ADMIN', label: 'Master' },
  { value: 'OWNER', label: 'Dono' },
  { value: 'EMPLOYEE', label: 'Funcionário' },
] as const;

const userFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome.'),
  email: z.string().trim().email('E-mail inválido.'),
  password: z.string().optional(),
  role: z.enum(['MASTER_ADMIN', 'OWNER', 'EMPLOYEE']),
  barbershopId: z.string().optional(),
  active: z.boolean(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export interface UserFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: UserListItem | null;
  selfUserId: string;
  onClose: () => void;
  onSaved: () => void;
}

const buildSchema = (mode: 'create' | 'edit') =>
  userFormSchema.superRefine((data, ctx) => {
    if (mode === 'create' && (!data.password || data.password.length < 6)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Mínimo de 6 caracteres.',
      });
    }
  });

const defaultsFor = (mode: 'create' | 'edit', user?: UserListItem | null): UserFormData => ({
  name: mode === 'edit' && user ? user.name : '',
  email: mode === 'edit' && user ? user.email : '',
  password: '',
  role: mode === 'edit' && user && user.role !== 'CUSTOMER' ? user.role : 'OWNER',
  barbershopId: (mode === 'edit' ? (user?.barbershopId ?? '') : ''),
  active: mode === 'edit' && user ? user.active : true,
});

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  mode,
  user,
  selfUserId,
  onClose,
  onSaved,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shops, setShops] = useState<BarbershopListItem[] | null>(null);
  const isSelf = mode === 'edit' && Boolean(user && user.id === selfUserId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: defaultsFor(mode, user),
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    adminApi
      .listBarbershops({ limit: 100 })
      .then((res) => {
        if (active) setShops(res.data);
      })
      .catch(() => {
        if (active) setShops([]);
      });
    return () => {
      active = false;
    };
  }, [open]);

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  const onSubmit = async (data: UserFormData) => {
    setSubmitError(null);
    try {
      if (mode === 'create') {
        await adminApi.createUser({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          barbershopId: data.barbershopId || null,
          active: data.active,
        });
      } else if (user) {
        await adminApi.updateUser(user.id, {
          name: data.name,
          email: data.email,
          role: data.role,
          active: data.active,
          barbershopId: data.barbershopId || null,
        });
      }
      onSaved();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    }
  };

  const inputClass = (hasError: boolean) => (hasError ? FIELD_CONTROL_ERROR : FIELD_CONTROL);

  return (
    <ModalShell
      open={open}
      title={mode === 'create' ? 'Novo usuário' : 'Editar usuário'}
      titleId="user-form-dialog-title"
      loading={isSubmitting}
      onClose={handleClose}
      body={
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {submitError && (
            <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {submitError}
            </p>
          )}
          <Field label="Nome" error={errors.name?.message}>
            <input
              type="text"
              autoComplete="off"
              className={inputClass(Boolean(errors.name))}
              {...register('name')}
            />
          </Field>
          <Field label="E-mail" error={errors.email?.message}>
            <input
              type="email"
              autoComplete="off"
              className={inputClass(Boolean(errors.email))}
              {...register('email')}
            />
          </Field>
          {mode === 'create' && (
            <Field
              label="Senha"
              hint="Mínimo de 6 caracteres. A senha nunca é exibida depois de criada."
              error={errors.password?.message}
            >
              <input
                type="password"
                autoComplete="new-password"
                className={inputClass(Boolean(errors.password))}
                {...register('password')}
              />
            </Field>
          )}
          <Field label="Papel" error={errors.role?.message}>
            <select
              disabled={isSelf}
              title={isSelf ? 'Você não pode alterar o próprio papel.' : undefined}
              className={inputClass(Boolean(errors.role))}
              {...register('role')}
            >
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Salão" error={errors.barbershopId?.message}>
            {shops === null ? (
              <p className="text-sm text-text-muted">Carregando salões…</p>
            ) : (
              <select className={inputClass(Boolean(errors.barbershopId))} {...register('barbershopId')}>
                <option value="">Sem salão</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              disabled={isSelf}
              title={isSelf ? 'Você não pode desativar a própria conta.' : undefined}
              {...register('active')}
            />
            Conta ativa
          </label>
        </form>
      }
      footer={
        <div className={FORM_FOOTER}>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="user-form"
            className="flex-1"
            loading={isSubmitting}
          >
            {mode === 'create' ? 'Criar usuário' : 'Salvar'}
          </Button>
        </div>
      }
    />
  );
};

export default UserFormDialog;
