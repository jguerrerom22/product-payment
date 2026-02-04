import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { CardDetails, PaymentGateway, PaymentGatewayTransactionResponse } from '../domain/payment-gateway.interface';

@Injectable()
export class WompiAdapter implements PaymentGateway {
  private readonly logger = new Logger(WompiAdapter.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_API_URL');
    this.publicKey = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_PUBLIC_KEY');
    this.privateKey = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_PRIVATE_KEY');
    this.integritySecret = this.configService.getOrThrow<string>('PAYMENT_GATEWAY_INTEGRITY_SECRET');
  }

  private async tokenizeCard(card: CardDetails): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/tokens/cards`,
        {
          number: card.number,
          cvc: card.cvc,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          card_holder: card.card_holder,
        },
        {
          headers: {
            Authorization: `Bearer ${this.publicKey}`,
          },
        }
      );
      return response.data.data.id;
    } catch (error: any) {
      this.logger.error('Error tokenizing card', error.response?.data || error.message);
      throw new Error('Could not tokenize credit card');
    }
  }

  private async getAcceptanceToken(): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/merchants/${this.publicKey}`);
      return response.data.data.presigned_acceptance.acceptance_token;
    } catch (error: any) {
      this.logger.error('Error fetching acceptance token', error.response?.data || error.message);
      throw new Error('Could not fetch acceptance token');
    }
  }

  private generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const stringToSign = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
  }

  async createTransaction(
    reference: string,
    amount: number,
    customerEmail: string,
    cardDetails: CardDetails,
    installments: number
  ): Promise<PaymentGatewayTransactionResponse> {
    this.logger.log(`Initiating payment transaction for ref ${reference} amount ${amount}`);
    
    // 1. Tokenize card
    const token = await this.tokenizeCard(cardDetails);
    
    // 2. Prepare transaction
    const amountInCents = Math.round(amount * 100);
    const currency = 'COP';
    const acceptanceToken = await this.getAcceptanceToken();
    const signature = this.generateIntegritySignature(reference, amountInCents, currency);

    try {
      const response = await axios.post(
        `${this.apiUrl}/transactions`,
        {
          amount_in_cents: amountInCents,
          currency,
          customer_email: customerEmail,
          payment_method: {
            type: 'CARD',
            token,
            installments,
          },
          reference,
          acceptance_token: acceptanceToken,
          signature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        }
      );

      const data = response.data.data;
      return {
        id: data.id,
        status: data.status,
        currency: data.currency,
        amount_in_cents: data.amount_in_cents,
      };
    } catch (error: any) {
      this.logger.error('Error creating payment transaction', error.response?.data || error.message);
      throw error;
    }
  }

  async getTransactionStatus(paymentGatewayId: string): Promise<PaymentGatewayTransactionResponse> {
    try {
      const response = await axios.get(`${this.apiUrl}/transactions/${paymentGatewayId}`, {
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
        },
      });

      const data = response.data.data;
      return {
        id: data.id,
        status: data.status,
        currency: data.currency,
        amount_in_cents: data.amount_in_cents,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching transaction ${paymentGatewayId}`, error.response?.data || error.message);
      throw error;
    }
  }
}
