import React, { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminFormShell, ADMIN_FORM_FOOTER } from './AdminFormShell';
import { UserSubscriptionSummary } from './UserSubscriptionSummary';
import { SmartSelect } from '../../components/ui/SmartSelect';
import { LuUserRound } from 'react-icons/lu';
import { SectionError } from '../../components/patterns';
import { Field, FIELD_CONTROL, FIELD_CONTROL_ERROR } from '../../components/ui/Field';
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
  barbershopId: mode === 'edit' ? (user?.barbershopId ?? '') : '',
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
  const [shopsError, setShopsError] = useState(false);
  const isSelf = mode === 'edit' && Boolean(user && user.id === selfUserId);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(buildSchema(mode)),
    defaultValues: defaultsFor(mode, user),
  });

  const selectedShopId = useWatch({ control, name: 'barbershopId' }) ?? '';
  const shopOptions = (shops ?? []).map(shop => ({ value: shop.id, label: shop.name }));
  if (user?.barbershopId && !shopOptions.some(shop => shop.value === user.barbershopId)) {
    shopOptions.unshift({
      value: user.barbershopId,
      label: user.barbershop?.name ?? 'Salão atual',
    });
  }

  useEffect(() => {
    if (!open) return;
    reset(defaultsFor(mode, user));
    setSubmitError(null);
  }, [open, mode, user, reset]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setShops(null);
    setShopsError(false);
    adminApi
      .listBarbershops({ limit: 100 })
      .then(res => {
        if (active) setShops(res.data);
      })
      .catch(() => {
        if (active) {
          setShops([]);
          setShopsError(true);
        }
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
    <AdminFormShell
      open={open}
      title={mode === 'create' ? 'Novo usuário' : 'Editar usuário'}
      titleId="user-form-dialog-title"
      icon={<LuUserRound size={20} aria-hidden="true" />}
      description="Dados, acesso e assinatura do salão."
      loading={isSubmitting}
      onClose={handleClose}
      body={
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {submitError && <SectionError message={submitError} />}
          <fieldset className="space-y-4">
            <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
              Dados pessoais
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
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
            </div>
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
          </fieldset>
          {mode === 'edit' && <UserSubscriptionSummary shopId={selectedShopId} />}
          <fieldset className="space-y-4">
            <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
              Acesso e vínculo
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <SmartSelect
                    label="Papel"
                    options={[...ROLES]}
                    value={field.value}
                    onChange={value => field.onChange(value ?? 'OWNER')}
                    clearable={false}
                    searchable={false}
                    disabled={isSelf}
                    error={errors.role?.message}
                  />
                )}
              />
              <Controller
                name="barbershopId"
                control={control}
                render={({ field }) => (
                  <SmartSelect
                    label="Salão"
                    options={[{ value: '', label: 'Sem salão' }, ...shopOptions]}
                    value={field.value ?? ''}
                    onChange={value => field.onChange(value ?? '')}
                    clearable={false}
                    loading={shops === null}
                    disabled={shopsError}
                    placeholder="Selecione um salão"
                    searchPlaceholder="Buscar salão…"
                    error={errors.barbershopId?.message}
                  />
                )}
              />
            </div>
            {isSelf && (
              <p className="text-xs text-text-muted">
                Você não pode alterar o próprio papel ou desativar sua conta.
              </p>
            )}
            {shopsError && (
              <p role="alert" className="text-sm text-warning">
                Não foi possível carregar os salões. O vínculo atual será preservado.
              </p>
            )}
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-bg/50 p-4">
              <span>
                <span className="block text-sm font-semibold text-text-primary">Conta ativa</span>
                <span className="mt-1 block text-xs text-text-secondary">
                  Permite o acesso do usuário ao sistema.
                </span>
              </span>
              <input
                type="checkbox"
                aria-label="Conta ativa"
                className="h-5 w-5 shrink-0 accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                disabled={isSelf}
                title={isSelf ? 'Você não pode desativar a própria conta.' : undefined}
                {...register('active')}
              />
            </label>
          </fieldset>
        </form>
      }
      footer={
        <div className={ADMIN_FORM_FOOTER}>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button type="submit" form="user-form" className="flex-1" loading={isSubmitting}>
            {mode === 'create' ? 'Criar usuário' : 'Salvar'}
          </Button>
        </div>
      }
    />
  );
};

export default UserFormDialog;
