import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { MarketingNav } from '../components/marketing/MarketingNav'
import { MarketingFooter } from '../components/marketing/MarketingFooter'

export const EmailVerifiedPage: React.FC = () => {
	const [params] = useSearchParams()
	const rawError = params.get('erro')
	const error = rawError
		? /token|expir|inválid|utiliz/i.test(rawError)
			? rawError
			: 'Não foi possível verificar o e-mail. Solicite um novo link ou tente novamente.'
		: null

	return (
		<div className="min-h-screen bg-bg text-text-primary flex flex-col">
			<MarketingNav />
			<main className="flex-1 flex items-center justify-center px-4 py-16">
				<div className="max-w-md w-full rounded-2xl border border-border bg-surface p-8 text-center space-y-4">
					{error ? (
						<>
							<div className="mx-auto w-12 h-12 rounded-full bg-danger/15 flex items-center justify-center text-danger">
								<AlertCircle size={24} />
							</div>
							<h1 className="text-xl font-extrabold">Não foi possível verificar</h1>
							<p className="text-sm text-text-muted">{error}</p>
						</>
					) : (
						<>
							<div className="mx-auto w-12 h-12 rounded-full bg-success/15 flex items-center justify-center text-success">
								<CheckCircle2 size={24} />
							</div>
							<h1 className="text-xl font-extrabold">E-mail verificado</h1>
							<p className="text-sm text-text-muted">
								Sua conta está confirmada. Você já pode entrar no painel.
							</p>
						</>
					)}
					<Link
						to="/login"
						className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-accent-fg text-sm font-bold hover:bg-accent-hover transition-colors"
					>
						Ir para o login <ArrowRight size={16} />
					</Link>
				</div>
			</main>
			<MarketingFooter />
		</div>
	)
}
