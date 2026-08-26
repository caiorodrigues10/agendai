import React, { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../infra/authApi'
import { Logo } from '../components/ui/Logo'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { PasswordInput } from '../components/ui/PasswordInput'
import {
  ArrowRight,
  LockKeyhole,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react'

const inputClass = (hasError: boolean) =>
  `w-full bg-bg border rounded-xl py-3 pl-4 pr-4 text-text-primary text-sm
   outline-none transition-all placeholder:text-text-muted
   focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]
   ${
     hasError
       ? 'border-danger/40 text-danger focus:border-danger'
       : 'border-border focus:border-accent/50 hover:border-border-strong'
   }`

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirmPassword,
    [newPassword, confirmPassword]
  )

  const isValid = token.length > 10 && newPassword.length >= 6 && passwordsMatch

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitting(true)
    setError(null)
    try {
      await authApi.resetPassword(token, newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err?.message || 'Token inválido ou expirado. Solicite um novo link de redefinição.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl p-8 text-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <Logo size="md" />
          </div>
          <AlertCircle size={32} className="text-danger mx-auto mb-4" />
          <h2 className="text-lg font-bold text-text-primary mb-2">Link inválido</h2>
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
    )
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
              <LockKeyhole size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Senha redefinida
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={24} className="text-success" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Senha alterada com sucesso!</h2>
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
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
        <div
          className="h-1 w-full opacity-80"
          style={{
            background:
              'linear-gradient(to right, transparent, #00c2b3, transparent)',
          }}
        />
        <div className="p-8 flex flex-col items-center">
          <div className="mb-6 flex flex-col items-center gap-4">
            <button type="button" onClick={() => navigate('/login')} className="cursor-pointer">
              <Logo size="md" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
              <LockKeyhole size={10} className="text-text-muted" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Redefinir senha
              </span>
            </div>
          </div>

          {error && (
            <div className="w-full mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-xs font-medium">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] text-text-muted text-center leading-relaxed">
                Crie uma nova senha segura para sua conta.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Nova senha
                </label>
                <PasswordInput
                  showStrength
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-accent">
                  Confirmar nova senha
                </label>
                <PasswordInput
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            className="mt-4 text-[11px] text-text-muted hover:text-accent transition-colors"
          >
            Solicitar um novo link
          </button>
        </div>
      </div>
    </div>
  )
}
