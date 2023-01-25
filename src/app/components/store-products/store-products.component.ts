import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  combineLatest,
  debounceTime,
  map,
  Observable,
  startWith,
  switchMap,
} from 'rxjs';
import { ProductModel } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { StoreModel } from '../../models/store.model';
import { StoreService } from '../../services/store.service';

interface StoreModelQuery {
  name: string;
  logoUrl: string;
  distance: number;
}

@Component({
  selector: 'app-store-products',
  styleUrls: ['./store-products.component.scss'],
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsComponent {
  readonly search: FormControl = new FormControl();

  readonly storeId$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['storeId'])
  );
  readonly store$: Observable<StoreModelQuery> = this.storeId$.pipe(
    switchMap((id) => this._storeService.getOneStore(id)),
    map((store) => ({
      name: store.name,
      logoUrl: store.logoUrl,
      distance: Math.round(store.distanceInMeters / 100) / 10,
    }))
  );

  readonly storeProducts$: Observable<ProductModel[]> = combineLatest([
    this._productService.getAll(),
    this.storeId$,
    this.search.valueChanges.pipe(debounceTime(1000), startWith('')),
  ]).pipe(
    map(([products, storeId, form]) =>
      products
        .filter((product) => {
          return product.storeIds.find((id) => id === storeId);
        })
        .filter((p) => p.name.toLowerCase().includes(form.toLowerCase()))
    )
  );

  constructor(
    private _productService: ProductService,
    private _storeService: StoreService,
    private _activatedRoute: ActivatedRoute
  ) {}
}
