import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../infra/authApi';
import { getErrorMessage } from '../utils/errorMessage';
import { getPendingResetToken } from '../utils/resetTokenUrl';
import {
  meetsNewPasswordPolicy,
  NEW_PASSWORD_RULE_HINT,
} from '../utils/passwordPolicy';
import { Logo } from '../components/ui/Logo';
import { ThemeToggle } from '../components/infra/ThemeToggle';
import { PasswordInput } from '../components/ui/PasswordInput';
import { SectionError } from '../components/patterns/states/SectionError';
import {
  LuArrowRight as ArrowRight,
  LuLockKeyhole as LockKeyhole,
  LuCircleAlert as AlertCircle,
  LuLoaderCircle as Loader2,
  LuCircleCheck as CheckCircle,
} from 'react-icons/lu';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Captura uma única vez: no browser real o entry já removeu o ?token= da URL
  // (o valor fica em memória); nos testes/MemoryRouter ele ainda está na URL.
  const [token] = useState(
    () => searchParams.get('token') ?? getPendingResetToken() ?? ''
  );

  // Remove o ?token= da URL do router logo após montar — em memória o token já
  // foi capturado acima; a URL limpa evita vazamento em analytics/referer/logs.
  useEffect(() => {
    if (!searchParams.get('token')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('token');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  );

  // O back exige token com mínimo de 32 caracteres (Zod min(32)) e senha nova
  // com 8+ caracteres, 1 letra e 1 número (política de senha nova).
  const isValid =
    token.length >= 32 &&
    meetsNewPasswordPolicy(newPassword) &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          'Token inválido ou expirado. Solicite um novo link de redefinição.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect automático após o sucesso — com cleanup para não navegar em dobro
  // se o usuário clicar em "Ir para o login" antes dos 3s.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate('/login'), 3000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  if (!token) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Logo size="md" />
          </div>
          <AlertCircle size={32} className="text-danger mx-auto mb-4" />
          <h1 className="text-lg font-bold text-text-primary mb-2">Link inválido</h1>
          <p className="text-sm text-text-muted mb-6">
            Este link de redefinição de senha é inválido. Solicite um novo link.
          </p>
          <button
            type="button"
            onClick={() => navigate('/esqueci-senha')}
            className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300"
          >
            Solicitar novo link <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <LockKeyhole size={10} className="text-text-muted" />
              <span className="text-2xs font-bold text-text-muted uppercase tracking-widest">
                Senha redefinida
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h1 className="text-lg font-bold text-text-primary mb-2">Senha alterada com sucesso!</h1>
          <p className="text-sm text-text-muted leading-relaxed mb-6">
            Você será redirecionado para a tela de login em alguns segundos.
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
    <div className="min-h-dvh bg-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div
          className="h-1 w-full opacity-80"
          style={{
            background: 'linear-gradient(to right, transparent, #00c2b3, transparent)',
          }}
        />
        <div className="p-8 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <button type="button" onClick={() => navigate('/login')} className="min-h-11 cursor-pointer lg:min-h-0">
              <Logo size="md" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <LockKeyhole size={10} className="text-text-muted" />
              <h1 className="text-2xs font-bold text-text-muted uppercase tracking-widest">
                Redefinir senha
              </h1>
            </div>
          </div>

          {error && <SectionError message={error} className="w-full mb-4" />}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-4">
              <p className="text-2xs text-text-muted text-center leading-relaxed">
                Crie uma nova senha segura para sua conta.
              </p>

              <div className="space-y-1">
                <label
                  htmlFor="reset-new-password"
                  className="text-2xs font-bold uppercase tracking-wider text-accent"
                >
                  Nova senha
                </label>
                <PasswordInput
                  id="reset-new-password"
                  autoComplete="new-password"
                  showStrength
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword(v => !v)}
                  placeholder={NEW_PASSWORD_RULE_HINT}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <p className="text-2xs text-text-muted">{NEW_PASSWORD_RULE_HINT}</p>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="reset-confirm-password"
                  className="text-2xs font-bold uppercase tracking-wider text-accent"
                >
                  Confirmar nova senha
                </label>
                <PasswordInput
                  id="reset-confirm-password"
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
                  Redefinir senha <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/esqueci-senha')}
            className="mt-4 text-2xs text-text-muted hover:text-accent transition-colors"
          >
            Solicitar um novo link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
