import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import {
	LoginSchema,
	LoginFormData,
	RegisterSchema,
	RegisterFormData,
} from '../schemas'
import { useAuth } from '../contexts/AuthContext'
import { authStorage } from '../infra/authStorage'
import { Logo } from '../components/ui/Logo'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { PasswordInput } from '../components/ui/PasswordInput'
import {
	ArrowRight,
	LockKeyhole,
	AlertCircle,
	Mail,
	Loader2,
	User,
	Store,
	Smartphone,
	CreditCard,
	Building2,
} from 'lucide-react'
import {
	normalizeDocument,
	maskCpf,
	maskCnpj,
	isValidDocument,
} from '../utils/documentUtils'

type Tab = 'login' | 'register'

const inputClass = (hasError: boolean) =>
	`w-full bg-bg border rounded-xl py-3 pl-10 pr-4 text-text-primary text-sm
   outline-none transition-all placeholder:text-text-muted
   focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]
   ${
			hasError
				? 'border-danger/40 text-danger focus:border-danger'
				: 'border-border focus:border-accent/50 hover:border-border-strong'
		}`

export const LoginPage: React.FC = () => {
	const navigate = useNavigate()
	const { user, login, register: registerUser } = useAuth()
	const [tab, setTab] = useState<Tab>('login')
	const [showPassword, setShowPassword] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)

	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(LoginSchema),
	})

	const registerForm = useForm<RegisterFormData>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: { cnpj: '' },
	})

	const handleLogoClick = () => {
		if (!user) {
			navigate('/')
			return
		}
		const role = user.role.toUpperCase()
		if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
			navigate('/master/dashboard')
			return
		}
		navigate('/app/queue')
	}

	const navigateAfterAuth = () => {
		const loggedUser = authStorage.getUser()
		if (loggedUser) {
			const role = loggedUser.role.toUpperCase()
			if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
				navigate('/master/dashboard')
				return
			}
		}
		navigate('/app/queue')
	}

	const handleLogin = async (data: LoginFormData) => {
		setFormError(null)
		setSubmitting(true)
		const result = await login(data.email, data.password)
		setSubmitting(false)
		if (!result.ok) {
			setFormError(result.message)
			return
		}
		navigateAfterAuth()
	}

	const handleRegister = async (data: RegisterFormData) => {
		setFormError(null)
		const cpf = normalizeDocument(data.cpf)
		if (!isValidDocument('CPF', cpf)) {
			setFormError('CPF inválido. Confira o número digitado.')
			return
		}
		setSubmitting(true)
		const result = await registerUser({
			ownerName: data.ownerName.trim(),
			email: data.email.trim(),
			password: data.password,
			cpf,
			barbershopName: data.barbershopName.trim(),
			whatsapp: normalizeDocument(data.whatsapp),
			cnpj: data.cnpj ? normalizeDocument(data.cnpj) : undefined,
		})
		setSubmitting(false)
		if (!result.ok) {
			setFormError(result.message)
			return
		}
		navigateAfterAuth()
	}

	const registerPassword = registerForm.watch('password') ?? ''

	const switchTab = (next: Tab) => {
		setTab(next)
		setFormError(null)
	}

	return (
		<div className="min-h-screen bg-bg flex items-center justify-center p-4 relative">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			<div className="w-full max-w-[420px] bg-surface border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
				<div
					className="h-1 w-full opacity-80"
					style={{
						background:
							'linear-gradient(to right, transparent, #00c2b3, transparent)',
					}}
				/>
				<div className="p-8 flex flex-col items-center overflow-y-auto flex-1">
					<div className="mb-6 flex flex-col items-center gap-4 shrink-0">
						<button type="button" onClick={handleLogoClick} className="cursor-pointer">
							<Logo size="md" />
						</button>
						<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bg border border-border">
							<LockKeyhole size={10} className="text-text-muted" />
							<span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
								{tab === 'login' ? 'Acesso Restrito' : 'Novo Salão'}
							</span>
						</div>
					</div>

					<div className="flex w-full border-b border-border mb-6 shrink-0">
						{(
							[
								{ id: 'login' as const, label: 'Entrar' },
								{ id: 'register' as const, label: 'Criar conta' },
							] as const
						).map((t) => (
							<button
								key={t.id}
								type="button"
								onClick={() => switchTab(t.id)}
								className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-colors ${
									tab === t.id
										? 'text-accent border-b-2 border-accent'
										: 'text-text-muted hover:text-text-secondary'
								}`}
							>
								{t.label}
							</button>
						))}
					</div>

					{formError && (
						<div className="w-full mb-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2 text-danger text-xs font-medium">
							<AlertCircle size={14} className="shrink-0" />
							{formError}
						</div>
					)}

					{tab === 'login' && (
						<form
							onSubmit={loginForm.handleSubmit(handleLogin)}
							className="w-full space-y-6"
						>
							<div className="space-y-4">
								<div className="space-y-1">
									<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
										E-mail
									</label>
									<div className="relative group">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<Mail
												size={16}
												className="text-text-muted group-focus-within:text-accent transition-colors"
											/>
										</div>
										<input
											type="email"
											className={inputClass(!!loginForm.formState.errors.email)}
											placeholder="seu@email.com"
											autoFocus
											{...loginForm.register('email')}
										/>
									</div>
									{loginForm.formState.errors.email && (
										<span className="text-[10px] font-medium text-danger flex items-center gap-1">
											<AlertCircle size={10} />{' '}
											{loginForm.formState.errors.email.message}
										</span>
									)}
								</div>

								<div className="space-y-1">
									<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
										Senha
									</label>
									<PasswordInput
										showPassword={showPassword}
										onToggleShow={() => setShowPassword((v) => !v)}
										error={loginForm.formState.errors.password?.message}
										placeholder="••••••••"
										{...loginForm.register('password')}
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60"
							>
								{submitting ? (
									<Loader2 size={14} className="animate-spin" />
								) : (
									<>
										Entrar <ArrowRight size={14} />
									</>
								)}
							</button>
						</form>
					)}

					{tab === 'register' && (
						<form
							onSubmit={registerForm.handleSubmit(handleRegister)}
							className="w-full space-y-4"
						>
							<p className="text-[11px] text-text-muted text-center leading-relaxed">
								Crie seu salão e comece com{' '}
								<strong className="text-text-secondary">30 dias grátis</strong>{' '}
								para testar.
							</p>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									Seu nome
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<User
											size={16}
											className="text-text-muted group-focus-within:text-accent transition-colors"
										/>
									</div>
									<input
										className={inputClass(
											!!registerForm.formState.errors.ownerName,
										)}
										placeholder="João Silva"
										autoFocus
										{...registerForm.register('ownerName')}
									/>
								</div>
								{registerForm.formState.errors.ownerName && (
									<span className="text-[10px] font-medium text-danger flex items-center gap-1">
										<AlertCircle size={10} />{' '}
										{registerForm.formState.errors.ownerName.message}
									</span>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									E-mail
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail
											size={16}
											className="text-text-muted group-focus-within:text-accent transition-colors"
										/>
									</div>
									<input
										type="email"
										className={inputClass(
											!!registerForm.formState.errors.email,
										)}
										placeholder="seu@email.com"
										{...registerForm.register('email')}
									/>
								</div>
								{registerForm.formState.errors.email && (
									<span className="text-[10px] font-medium text-danger flex items-center gap-1">
										<AlertCircle size={10} />{' '}
										{registerForm.formState.errors.email.message}
									</span>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									CPF
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<CreditCard
											size={16}
											className="text-text-muted group-focus-within:text-accent transition-colors"
										/>
									</div>
									<input
										className={inputClass(!!registerForm.formState.errors.cpf)}
										placeholder="000.000.000-00"
										value={registerForm.watch('cpf') ?? ''}
										onChange={(e) =>
											registerForm.setValue('cpf', maskCpf(e.target.value), {
												shouldValidate: true,
											})
										}
									/>
								</div>
								{registerForm.formState.errors.cpf && (
									<span className="text-[10px] font-medium text-danger flex items-center gap-1">
										<AlertCircle size={10} />{' '}
										{registerForm.formState.errors.cpf.message}
									</span>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									Nome do salão
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Store
											size={16}
											className="text-text-muted group-focus-within:text-accent transition-colors"
										/>
									</div>
									<input
										className={inputClass(
											!!registerForm.formState.errors.barbershopName,
										)}
										placeholder="Salão Beleza & Estilo"
										{...registerForm.register('barbershopName')}
									/>
								</div>
								{registerForm.formState.errors.barbershopName && (
									<span className="text-[10px] font-medium text-danger flex items-center gap-1">
										<AlertCircle size={10} />{' '}
										{registerForm.formState.errors.barbershopName.message}
									</span>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									WhatsApp do salão
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Smartphone
											size={16}
											className="text-text-muted group-focus-within:text-accent transition-colors"
										/>
									</div>
									<input
										className={inputClass(
											!!registerForm.formState.errors.whatsapp,
										)}
										placeholder="(11) 99999-9999"
										{...registerForm.register('whatsapp')}
									/>
								</div>
								{registerForm.formState.errors.whatsapp && (
									<span className="text-[10px] font-medium text-danger flex items-center gap-1">
										<AlertCircle size={10} />{' '}
										{registerForm.formState.errors.whatsapp.message}
									</span>
								)}
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									CNPJ{' '}
									<span className="text-text-muted font-normal normal-case">
										(opcional)
									</span>
								</label>
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Building2
											size={16}
											className="text-text-muted group-focus-within:text-accent transition-colors"
										/>
									</div>
									<input
										className={inputClass(false)}
										placeholder="00.000.000/0000-00"
										value={registerForm.watch('cnpj') ?? ''}
										onChange={(e) =>
											registerForm.setValue('cnpj', maskCnpj(e.target.value), {
												shouldValidate: true,
											})
										}
									/>
								</div>
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold uppercase tracking-wider text-accent">
									Senha
								</label>
								<PasswordInput
									showStrength
									showPassword={showPassword}
									onToggleShow={() => setShowPassword((v) => !v)}
									error={registerForm.formState.errors.password?.message}
									placeholder="Crie uma senha segura"
									value={registerPassword}
									{...registerForm.register('password')}
								/>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full py-4 bg-accent text-accent-fg hover:bg-accent-hover shadow-lg shadow-accent/20 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-60 mt-2"
							>
								{submitting ? (
									<Loader2 size={14} className="animate-spin" />
								) : (
									<>
										Criar conta <ArrowRight size={14} />
									</>
								)}
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	)
}
