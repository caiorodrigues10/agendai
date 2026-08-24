import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Gift, RefreshCcw, TrendingUp, Users, Award } from 'lucide-react'
import { adminApi, ReferralPlatformStats } from '../../infra/adminApi'
import { getErrorMessage } from '../../utils/errorMessage'

export const ReferralsTab: React.FC = () => {
	const [data, setData] = useState<ReferralPlatformStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchStats = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await adminApi.getReferralStats()
			setData(res)
		} catch (err) {
			setError(getErrorMessage(err, 'Não foi possível carregar indicações.'))
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		void fetchStats()
	}, [fetchStats])

	if (loading && !data) {
		return (
			<div className="space-y-4 animate-pulse">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-24 bg-surface-2 rounded-xl" />
					))}
				</div>
				<div className="h-48 bg-surface-2 rounded-2xl" />
			</div>
		)
	}

	if (error && !data) {
		return (
			<div className="p-4 rounded-xl border border-danger/30 bg-danger/10 text-danger text-sm flex gap-2 items-start">
				<AlertCircle size={16} className="shrink-0 mt-0.5" />
				<div className="flex-1">
					{error}
					<button
						type="button"
						onClick={() => void fetchStats()}
						className="mt-2 text-xs font-bold underline"
					>
						Tentar de novo
					</button>
				</div>
			</div>
		)
	}

	if (!data) return null

	const maxMonth = Math.max(1, ...data.monthlyEvolution.map((m) => m.count))

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
						<Gift size={18} className="text-violet-400" />
						Indicações da plataforma
					</h2>
					<p className="text-xs text-text-muted mt-1">
						Métricas globais do programa dono→dono
					</p>
				</div>
				<button
					type="button"
					onClick={() => void fetchStats()}
					disabled={loading}
					className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-all"
					title="Atualizar"
				>
					<RefreshCcw size={14} className={loading ? 'animate-spin text-violet-400' : ''} />
				</button>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{[
					{ label: 'Total', value: data.totalReferrals, icon: Users },
					{ label: 'Convertidas', value: data.converted, icon: TrendingUp },
					{ label: 'Taxa', value: `${data.conversionRate}%`, icon: Gift },
					{ label: 'Dias creditados', value: data.totalCreditDays, icon: Award },
				].map((kpi) => (
					<div
						key={kpi.label}
						className="rounded-xl border border-border bg-surface px-4 py-3"
					>
						<kpi.icon size={14} className="text-violet-400 mb-2" />
						<p className="text-2xl font-black text-text-primary">{kpi.value}</p>
						<p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1">
							{kpi.label}
						</p>
					</div>
				))}
			</div>

			<div className="grid lg:grid-cols-2 gap-4">
				<div className="rounded-2xl border border-border bg-surface overflow-hidden">
					<div className="px-4 py-3 border-b border-border">
						<p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
							Top indicadores
						</p>
					</div>
					{data.topReferrers.length === 0 ? (
						<p className="p-4 text-sm text-text-muted">Nenhuma conversão ainda.</p>
					) : (
						<ul className="divide-y divide-border">
							{data.topReferrers.map((r) => (
								<li
									key={r.barbershopId}
									className="px-4 py-3 flex items-center justify-between gap-3"
								>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-text-primary truncate">
											{r.barbershopName}
										</p>
										<p className="text-[11px] text-text-muted">
											{r.totalReferrals} convertida
											{r.totalReferrals !== 1 ? 's' : ''}
										</p>
									</div>
									<p className="text-sm font-bold text-violet-400 shrink-0">
										+{r.creditDays}d
									</p>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className="rounded-2xl border border-border bg-surface p-4">
					<p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
						Evolução mensal
					</p>
					{data.monthlyEvolution.length === 0 ? (
						<p className="text-sm text-text-muted">Sem dados nos últimos 12 meses.</p>
					) : (
						<div className="flex items-end gap-1.5 h-40">
							{data.monthlyEvolution.map((m) => (
								<div
									key={m.month}
									className="flex-1 flex flex-col items-center gap-1 min-w-0"
									title={`${m.month}: ${m.count}`}
								>
									<span className="text-[9px] text-text-muted">{m.count}</span>
									<div
										className="w-full rounded-t bg-violet-500/70 min-h-[2px]"
										style={{ height: `${(m.count / maxMonth) * 100}%` }}
									/>
									<span className="text-[8px] text-text-muted truncate w-full text-center">
										{m.month.slice(5)}
									</span>
								</div>
							))}
						</div>
					)}
					<div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
						<div className="rounded-lg bg-bg border border-border py-2">
							<p className="font-bold text-text-primary">{data.pending}</p>
							<p className="text-text-muted">Pendentes</p>
						</div>
						<div className="rounded-lg bg-bg border border-border py-2">
							<p className="font-bold text-text-primary">{data.converted}</p>
							<p className="text-text-muted">Convertidas</p>
						</div>
						<div className="rounded-lg bg-bg border border-border py-2">
							<p className="font-bold text-text-primary">{data.rejected}</p>
							<p className="text-text-muted">Revertidas</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
