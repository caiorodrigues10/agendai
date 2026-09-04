export const productMoney = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const PAYMENT_LABEL: Record<string, string> = {
  pix: 'PIX',
  cash: 'Dinheiro',
  credit_card: 'Crédito',
  debit_card: 'Débito',
  fiado: 'Fiado',
};

export const SALE_STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Concluída',
  REFUNDED: 'Estornada',
  CANCELED: 'Cancelada',
};

export const MOVEMENT_LABEL: Record<string, string> = {
  PURCHASE_RECEIPT: 'Compra',
  SALE: 'Venda',
  SALE_REFUND: 'Estorno',
  INTERNAL_CONSUMPTION: 'Consumo interno',
  MANUAL_ADJUSTMENT: 'Ajuste manual',
  PURCHASE_REVERSAL: 'Estorno de compra',
};
