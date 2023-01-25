import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreProductsComponent } from './components/store-products/store-products.component';
import { HomeComponent } from './components/home/home.component';
import { ProductsInCategoryComponent } from './components/products-in-category/products-in-category.component';
import { StoreProductsComponentModule } from './components/store-products/store-products.component-module';
import { HomeComponentModule } from './components/home/home.component-module';
import { CategoryProductsComponentModule } from './components/category-products/category-products.component-module';
import { ProductsInCategoryComponentModule } from './components/products-in-category/products-in-category.component-module';

const routes: Routes = [
  { path: 'stores/:storeId', component: StoreProductsComponent },
  { path: '', component: HomeComponent },
  {
    path: 'categoryProducts/:categoryId',
    component: ProductsInCategoryComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    StoreProductsComponentModule,
    HomeComponentModule,
    CategoryProductsComponentModule,
    ProductsInCategoryComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
