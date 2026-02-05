export interface CardDetails {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface PaymentGatewayTransactionResponse {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | 'VOIDED';
  currency: string;
  amount_in_cents: number;
}

export interface PaymentGateway {
  createTransaction(
    reference: string,
    amount: number,
    customerEmail: string,
    cardDetails: CardDetails,
    installments: number
  ): Promise<PaymentGatewayTransactionResponse>;

  getTransactionStatus(id: string): Promise<PaymentGatewayTransactionResponse>;
}

export const PAYMENT_GATEWAY_PROVIDER = 'PAYMENT_GATEWAY_PROVIDER';
