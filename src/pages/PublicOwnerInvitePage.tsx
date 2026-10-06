import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../infra/authApi';
import { Logo } from '../components/ui/Logo';
import { ThemeToggle } from '../components/infra/ThemeToggle';
import { PasswordInput } from '../components/ui/PasswordInput';
import { SectionError } from '../components/patterns/states/SectionError';
import {
  LuArrowRight as ArrowRight,
  LuKeyRound as KeyRound,
  LuLoaderCircle as Loader2,
  LuCircleCheck as CheckCircle,
} from 'react-icons/lu';

const STRONG_ENOUGH = (value: string) =>
  value.length >= 6 && /[a-zA-Z]/.test(value) && /\d/.test(value);

interface OwnerInviteFormProps {
  token: string;
  onSuccess: () => void;
}

const OwnerInviteForm: React.FC<OwnerInviteFormProps> = ({ token, onSuccess }) => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword],
  );

  const isValid = token.length >= 32 && STRONG_ENOUGH(newPassword) && passwordsMatch;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await authApi.acceptInvite(token, newPassword);
      onSuccess();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'Link inválido ou expirado. Solicite um novo convite.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && <SectionError message={error} className="w-full mb-4" />}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-4">
          <p className="text-[11px] text-text-muted text-center leading-relaxed">
            Defina a senha de acesso ao painel do seu salão.
          </p>

          <div className="space-y-1">
            <label
              htmlFor="invite-new-password"
              className="text-[10px] font-bold uppercase tracking-wider text-accent"
            >
              Nova senha
            </label>
            <PasswordInput
              id="invite-new-password"
              autoComplete="new-password"
              showStrength
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(v => !v)}
              placeholder="Mínimo 6 caracteres, letras e números"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="invite-confirm-password"
              className="text-[10px] font-bold uppercase tracking-wider text-accent"
            >
              Confirmar nova senha
            </label>
            <PasswordInput
              id="invite-confirm-password"
              autoComplete="new-password"
              showPassword={showPassword}
              onToggleShow={() => setShowPassword(v => !v)}
              placeholder="Repita a nova senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={
                confirmPassword.length > 0 && !passwordsMatch
                  ? 'As senhas não coincidem'
                  : undefined
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !isValid}
          className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>
              Definir senha <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate('/login')}
        className="mt-4 text-[11px] text-text-muted hover:text-accent transition-colors"
      >
        Ir para o login
      </button>
    </>
  );
};

export const PublicOwnerInvitePage: React.FC = () => {
  const navigate = useNavigate();
  const { token = '' } = useParams<{ token: string }>();
  const [success, setSuccess] = useState(false);

  if (!token || token.length < 32) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Logo size="md" />
            <KeyRound size={32} className="text-danger mx-auto" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Link inválido</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Este link de convite é inválido. Peça ao administrador para reenviar o convite.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
          >
            Ir para o login <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <KeyRound size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Convite aceito
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Senha definida com sucesso!</h2>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Agora você já pode entrar no painel com seu e-mail e a nova senha.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
          >
            Ir para o login <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div
          className="h-1 w-full opacity-80"
          style={{ background: 'linear-gradient(to right, transparent, #00c2b3, transparent)' }}
        />
        <div className="p-8 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <button type="button" onClick={() => navigate('/login')} className="cursor-pointer">
              <Logo size="md" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <KeyRound size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Aceitar convite
              </span>
            </div>
          </div>

          <OwnerInviteForm token={token} onSuccess={() => setSuccess(true)} />
        </div>
      </div>
    </div>
  );
};

export default PublicOwnerInvitePage;
