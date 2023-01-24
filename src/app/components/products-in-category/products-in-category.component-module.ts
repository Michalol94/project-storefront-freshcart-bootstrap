import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductsInCategoryComponent } from './products-in-category.component';

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  declarations: [ProductsInCategoryComponent],
  providers: [],
  exports: [ProductsInCategoryComponent],
})
export class ProductsInCategoryComponentModule {}
