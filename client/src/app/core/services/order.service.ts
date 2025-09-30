import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Order, OrderToCreate } from '../../shared/models/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  orderComplete = false;

  createOrder(orderToCreate: OrderToCreate) {
    const url = `${this.baseUrl}orders`;

    return this.http.post<Order>(url, orderToCreate);
  }

  getOrdersForUser() {
    const url = `${this.baseUrl}orders`;

    return this.http.get<Order[]>(url);
  }

  getOrderDetailed(id: number) {
    const url = `${this.baseUrl}orders/${id}`;

    return this.http.get<Order>(url);
  }
}
