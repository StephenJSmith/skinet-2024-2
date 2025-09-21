import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { Product } from '../../shared/models/product';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';
import { FiltersDialogComponent } from './filters-dialog/filters-dialog.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ShopParams } from '../../shared/models/shopParams';
import { Pagination } from '../../shared/models/pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shop',
  imports: [
    ProductItemComponent,
    MatButton,
    MatIcon,
    MatSelectionList,
    MatMenu,
    MatMenuTrigger,
    MatListOption,
    MatPaginator,
    FormsModule,
],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService);
  protected dialogService = inject(MatDialog);

  protected products?: Pagination<Product>;
  protected sortOptions = [
    {name: 'Alphabetical', value: 'name'},
    {name: 'Price: Low-High', value: 'priceAsc'},
    {name: 'Price: High-Low', value: 'priceDesc'},
  ];
  protected shopParams = new ShopParams();
  protected pageSizeOptions = [5, 10, 15, 20];
  
  ngOnInit(): void {
    this.initializeShop();
  }

  initializeShop() {
    this.shopService.getBrands();
    this.shopService.getTypes();
    this.getProducts();
  }

  getProducts() {
    this.shopService
      .getProducts(this.shopParams)
      .subscribe({
      next: response => this.products = response,
      error: err => console.log(err),
    });
  }
  
  openFiltersDialog() {
    const dialogRef = this.dialogService.open(
      FiltersDialogComponent, {
        minWidth: '500px',
        data: {
          selectedBrands: this.shopParams.brands,
          selectedTypes: this.shopParams.types,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.shopParams.brands = result.selectedBrands;
          this.shopParams.types = result.selectedTypes;
          this.shopParams.pageNumber = 1;
          this.getProducts();
        }
      });
  }

  onSearchChange() {
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  handlePageEvent(event: PageEvent) {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }
  
  onSortChange(event: any) {
    const selectedOption = event.options[0];
    if (!selectedOption) return;

    this.shopParams.sort = selectedOption.value;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }
}
