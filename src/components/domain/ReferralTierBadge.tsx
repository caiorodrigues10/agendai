import React from 'react'
import { Medal, Award, Crown } from 'lucide-react'
import type { ReferralTierName } from '../../infra/referralsApi'

interface ReferralTierBadgeProps {
	tier: ReferralTierName
	convertedCount: number
	nextTierIn: number | null
}

const TIER_CONFIG = {
	BRONZE: {
		label: 'Bronze',
		icon: Medal,
		accent: 'text-warning border-warning/40 bg-warning/10',
		bar: 'bg-warning',
	},
	SILVER: {
		label: 'Prata',
		icon: Award,
		accent: 'text-text-secondary border-border-strong bg-surface-2',
		bar: 'bg-text-secondary',
	},
	GOLD: {
		label: 'Ouro',
		icon: Crown,
		accent: 'text-accent border-accent/40 bg-accent/10',
		bar: 'bg-accent',
	},
} as const

export const ReferralTierBadge: React.FC<ReferralTierBadgeProps> = ({
	tier,
	convertedCount,
	nextTierIn,
}) => {
	const config = TIER_CONFIG[tier] ?? TIER_CONFIG.BRONZE
	const Icon = config.icon

	return (
		<div className={`rounded-2xl border p-4 ${config.accent}`}>
			<div className="flex items-center gap-3">
				<div className="p-2 rounded-xl bg-bg/40">
					<Icon size={24} />
				</div>
				<div>
					<p className="text-sm font-bold">Nível {config.label}</p>
					<p className="text-xs text-text-muted">
						{convertedCount} indicação
						{convertedCount !== 1 ? 'ões' : ''} convertida
						{convertedCount !== 1 ? 's' : ''}
					</p>
				</div>
			</div>
			{nextTierIn !== null && nextTierIn > 0 && (
				<div className="mt-3">
					<div className="flex justify-between text-[10px] text-text-muted mb-1">
						<span>Progresso para o próximo nível</span>
						<span>
							{nextTierIn} restante{nextTierIn !== 1 ? 's' : ''}
						</span>
					</div>
					<div className="h-2 bg-bg rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all ${config.bar}`}
							style={{
								width: `${Math.min(
									(convertedCount / (convertedCount + nextTierIn)) * 100,
									100,
								)}%`,
							}}
						/>
					</div>
				</div>
			)}
			{nextTierIn === null && (
				<p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-text-muted">
					Nível máximo atingido!
				</p>
			)}
		</div>
	)
}
