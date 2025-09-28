import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../shared/models/cart';
import { Product } from '../../shared/models/product';
import { map } from 'rxjs';
import { DeliveryMethod } from '../../shared/models/deliveryMethod';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  cart = signal<Cart | null>(null);

  itemCount = computed(() => {
    return this.cart()?.items
      .reduce((acc, item) => acc + item.quantity, 0);
  });

  selectedDelivery = signal<DeliveryMethod | null>(null);

  totals = computed(() => {
    const cart = this.cart(); 
    if (!cart) return null;

    const delivery = this.selectedDelivery();

    const subtotal = cart.items.reduce((acc, item) => 
      acc + (item.price * item.quantity), 0);
    const shipping =  delivery
      ? delivery.price
      : 0;
    const discount = 0;
    const total = subtotal + shipping - discount;

    return {
      subtotal,
      shipping,
      discount,
      total
    }
  });

  getCart(id: string) {
    const url = `${this.baseUrl}cart?id=${id}`;

    return this.http.get<Cart>(url).pipe(
      map(cart => {
        this.cart.set(cart);

        return cart;
      })
    );
  }

  setCart(cart: Cart) {
    const url = `${this.baseUrl}cart`;

    return this.http.post<Cart>(url, cart).subscribe({
      next: cart => this.cart.set(cart),
    });
  }

  addItemToCart(item: CartItem | Product, quantity = 1) {
    const cart = this.cart() ?? this.createCart();
    if (this.isProduct(item)) {
      item = this.mapProductToCartItem(item);
    }
    cart!.items = this.addOrUpdateItem(cart!.items, item, quantity);
    this.setCart(cart!);
  }

  removeItemFromCart(productId: number, quantity = 1) {
    const cart = this.cart();
    if (!cart) return;

    const index = cart.items.findIndex(x => x.productId === productId);
    if (index === -1) return;

    cart.items[index].quantity -= quantity;
    if (cart.items[index].quantity <= 0) {
      cart.items.splice(index, 1);
    }

    if (cart.items.length === 0) {
      this.deleteCart();
    } else {
      this.setCart(cart);
    }
  }

  deleteCart() {
    const url = `${this.baseUrl}cart?id=${this.cart()?.id}`;

    this.http.delete(url).subscribe({
      next: () => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }
    });
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number) {
    const index = items.findIndex(i => i.productId === item.productId);
    if (index === -1) {
      item.quantity = quantity;
      items.push(item);
    } else {
      items[index].quantity += quantity;
    }
    return items;
  }

  private mapProductToCartItem(product: Product): CartItem {
    var cartItem = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 0,
      pictureUrl: product.pictureUrl,
      brand: product.brand,
      type: product.type,
    };

    return cartItem;
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }
  
  private createCart(): Cart | null {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);

    return cart;
  }
}
