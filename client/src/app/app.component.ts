import { Component, inject, OnInit, signal } from '@angular/core';
import { HeaderComponent } from "./layout/header/header.component";
import { HttpClient } from '@angular/common/http';
import { Product } from './shared/models/product';
import { Pagination } from './shared/models/pagination';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);

  protected readonly title = 'client';
  products: Product[] = [];

  ngOnInit(): void {
    const url = this.baseUrl + 'products';
    this.http.get<Pagination<Product>>(url).subscribe({
      next: response => this.products = response.data,
      error: err => console.log(err),
      complete: () => console.log('complete')
    });
  }
}
