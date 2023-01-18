import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreProductsComponent } from './components/store-products/store-products.component';
import { HomeComponent } from './components/home/home.component';
import { CategoryProductsComponent } from './components/category-products/category-products.component';
import { StoreProductsComponentModule } from './components/store-products/store-products.component-module';
import { HomeComponentModule } from './components/home/home.component-module';
import { CategoryProductsComponentModule } from './components/category-products/category-products.component-module';

const routes: Routes = [
  { path: 'stores/:storeId', component: StoreProductsComponent },
  { path: '', component: HomeComponent },
  { path: 'categories/:categoryId', component: CategoryProductsComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    StoreProductsComponentModule,
    HomeComponentModule,
    CategoryProductsComponentModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
