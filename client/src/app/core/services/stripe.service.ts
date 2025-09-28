import { inject, Injectable } from '@angular/core';
import { ConfirmationToken, loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { CartService } from './cart.service';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../../shared/models/cart';
import { firstValueFrom, map } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private cartService = inject(CartService);
  private accountService = inject(AccountService);
  private stripePromise: Promise<Stripe | null>;
  private elements?: StripeElements;
  private addressEelement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  async createPaymentElement() {
    if (!this.paymentElement) {
      const elements = await this.initializeElements();
      if (elements) {
        this.paymentElement = elements.create('payment');
      } else {
        throw new Error('Elements instance has not been initialised');
      }
    }

    return this.paymentElement;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.stripePromise;
      if (stripe) {
        const cart = await firstValueFrom(this.createOrUpdatePaymentIntent());
        this.elements = stripe.elements({
          clientSecret: cart.clientSecret,
          appearance: { labels: 'floating' },
        });
      } else {
        throw new Error('Stripe has not been loaded');
      }
    }

    return this.elements;
  }

  async createAddressElement() {
    if (!this.addressEelement) {
      const elements = await this.initializeElements();
      if (elements) {
        const user = this.accountService.currentUser();
        let defaultValues: StripeAddressElementOptions['defaultValues'] = {}

        if (user) {
          defaultValues.name = `${user.firstName} ${user.lastName}`;
        }

        if (user?.address) {
          defaultValues.address = {
            line1: user.address.line1,
            line2: user.address.line2,
            city: user.address.city,
            state: user.address.state,
            country: user.address.country,
            postal_code: user.address.postalCode,
          }
        }

        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues,
        };
        this.addressEelement = elements.create('address', options);
      } else {
        throw new Error('Elements instance has not been loaded');
      }
    }

    return this.addressEelement;
  }

  async createConfirmationToken() {
    const stripe = await this.getStripeInstance();
    if (!stripe) throw new Error('Stripe not available');

    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw new Error(result.error.message);

    return await stripe.createConfirmationToken({elements});
  }

  createOrUpdatePaymentIntent() {
    const cart = this.cartService.cart();
    if (!cart) throw new Error('Problem with cart');

    const url = `${this.baseUrl}payments/${cart.id}`;

    return this.http.post<Cart>(url, {}).pipe(
      map(cart => {
        this.cartService.setCart(cart);

        return cart;
      })
    );
  }

  async confirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    if (!stripe) throw new Error('Stripe not available');

    const elements = await this.initializeElements();
    const result = await elements.submit();
    if (result.error) throw new Error(result.error.message);

    const clientSecret = this.cartService.cart()?.clientSecret;
    if (!clientSecret) throw new Error('Unable to load Stripe');

    return await stripe.confirmPayment({
      clientSecret: clientSecret,
      confirmParams: {
        confirmation_token: confirmationToken.id
      },
      redirect: 'if_required'
    });
  }

  disposeElements() {
    this.elements = undefined;
    this.addressEelement = undefined;
    this.paymentElement = undefined;
  }
}
