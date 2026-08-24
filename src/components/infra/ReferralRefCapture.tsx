import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { referralStorage } from '../../utils/referralStorage'

/** Captura `?ref=` em qualquer rota pública e guarda em sessionStorage. */
export const ReferralRefCapture: React.FC = () => {
	const [params] = useSearchParams()

	useEffect(() => {
		const ref = params.get('ref')
		if (ref) referralStorage.save(ref)
	}, [params])

	return null
}
