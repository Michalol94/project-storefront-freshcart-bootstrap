import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StoreProductsComponent } from './store-products.component';

@NgModule({
  imports: [CommonModule],
  declarations: [StoreProductsComponent],
  providers: [],
  exports: [StoreProductsComponent],
})
export class StoreProductsComponentModule {}
