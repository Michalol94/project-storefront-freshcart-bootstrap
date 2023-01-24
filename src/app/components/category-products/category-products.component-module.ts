import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CategoryProductsComponent } from './category-products.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  declarations: [CategoryProductsComponent],
  providers: [],
  exports: [CategoryProductsComponent],
})
export class CategoryProductsComponentModule {}
