import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Address, User } from '../../shared/models/user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);

  login(values: any) {
    const url = `${this.baseUrl}login`;
    let params = new HttpParams();
    params  = params.append('useCookies', true);

    return this.http.post<User>(url, values, { params });
  }

  register(values: any) {
    const url = `${this.baseUrl}account/register`;

    return this.http.post<User>(url, values);
  }

  getUserInfo() {
    const url = `${this.baseUrl}account/user-info`;

    return this.http.get<User>(url)
      .pipe(
        map(user => {
          this.currentUser.set(user);

          return user;
        })
      );
  }

  logout() {
    const url = `${this.baseUrl}account/logout`;

    return this.http.post(url, {});
  }

  updateAddress(address: Address) {
    const url = `${this.baseUrl}account/address`;

    return this.http.post<Address>(url, address);
  }

  getAuthState() {
    const url = `${this.baseUrl}account/auth-status`;

    return this.http.get<{isAuthenticated: boolean}>(url);
  }
}
