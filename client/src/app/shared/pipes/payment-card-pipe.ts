import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';
import { PaymentSummary } from '../models/order';

@Pipe({
  name: 'paymentCard'
})
export class PaymentCardPipe implements PipeTransform {

  transform(value?: ConfirmationToken['payment_method_preview'] | PaymentSummary, ...args: unknown[]): unknown {
    if (value && 'card' in value) {
      const { brand, last4, exp_month, exp_year } = (value as ConfirmationToken['payment_method_preview']).card!;

      return `${brand.toUpperCase()} **** **** **** ${last4}, Exp: ${exp_month}/${exp_year}`;
    }

    if (value && 'last4' in value) {
      const { last4, brand, expMonth, expYear } = value as PaymentSummary;

      return `${brand.toUpperCase()} **** **** **** ${last4}, Exp: ${expMonth}/${expYear}`;
    }

    return 'Unknown payment method';
  }

}
