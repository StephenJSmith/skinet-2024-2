import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../shared/models/cart';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  imports: [
    RouterLink,
    MatIcon,
    CurrencyPipe,
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  item = input.required<CartItem>();
  protected cartService = inject(CartService);

  protected incrementQuantity() {
    this.cartService.addItemToCart(this.item());
  }

  protected decrementQuantity() {
    this.cartService.removeItemFromCart(
      this.item().productId);
  }

  protected removeItemFromCart() {
    this.cartService.removeItemFromCart(
      this.item().productId, this.item().quantity);
  }
}
