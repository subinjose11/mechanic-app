// Payment model (subcollection of orders)
import { PaymentType, PaymentMethod } from '@core/constants';

export interface Payment {
  id: string;
  serviceOrderId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  date: Date;
  notes: string | null;
}

export interface CreatePaymentInput {
  serviceOrderId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  date?: Date;
  notes?: string;
}

export interface UpdatePaymentInput {
  amount?: number;
  paymentType?: PaymentType;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export function isAdvancePayment(payment: Payment): boolean {
  return payment.paymentType === 'advance';
}

export function isFinalPayment(payment: Payment): boolean {
  return payment.paymentType === 'final';
}

export function getTotalPayments(payments: Payment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

export function getTotalAdvances(payments: Payment[]): number {
  return payments
    .filter(isAdvancePayment)
    .reduce((sum, payment) => sum + payment.amount, 0);
}
