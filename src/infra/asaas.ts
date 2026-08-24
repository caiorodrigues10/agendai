/**
 * Utilitários Asaas no frontend.
 *
 * A tokenização pública no browser (`/creditCard/tokenizeCreditCard`) exige
 * `access_token` e falha por CORS — o checkout Asaas cartão envia os dados
 * no POST /subscriptions e o backend chama createPayment com creditCard.
 */

export {};
