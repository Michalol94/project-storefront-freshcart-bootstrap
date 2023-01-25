import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreProductsComponent } from './store-products.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule],
  declarations: [StoreProductsComponent],
  providers: [],
  exports: [StoreProductsComponent],
})
export class StoreProductsComponentModule {}
