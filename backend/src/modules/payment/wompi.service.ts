import { Injectable, Logger } from '@nestjs/common';

export interface WompiTransactionResponse {
  id: string; // Wompi Transaction ID
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  currency: string;
  amount_in_cents: number;
  // ... other fields
}

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);

  // In a real implementation this would make HTTP calls to Wompi API
  async createTransaction(
    reference: string,
    amount: number, // in units
    token: string,
    installments: number
  ): Promise<WompiTransactionResponse> {
    this.logger.log(`Initiating Wompi transaction for ref ${reference} amount ${amount}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple mock logic: 
    // If token starts with 'tok_test', approve.
    // If token starts with 'tok_declined', decline.
    // Else, random or pending.
    
    let status: 'APPROVED' | 'DECLINED' = 'APPROVED';
    if (token.includes('declined')) {
      status = 'DECLINED';
    }

    return {
      id: `wompi_${Math.random().toString(36).substring(7)}`,
      status: status,
      currency: 'COP',
      amount_in_cents: amount * 100,
    };
  }
}
