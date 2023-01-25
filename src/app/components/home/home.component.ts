import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ProductModel } from 'src/app/models/product.model';
import { StoreTagIdModel } from 'src/app/models/store-tag-id.model';
import { StoreWithTagsQueryModel } from 'src/app/models/store-with-tags-query.model';
import { ProductService } from 'src/app/services/product.service';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { CategoryService } from '../../services/category.service';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoryService.getAllCategories();

  readonly stores$: Observable<StoreModel[]> =
    this._storeService.getAllStores();

  readonly storesTagIds: Observable<StoreTagIdModel[]> =
    this._storeService.getAllStoreTags();

  readonly storesWithCategories$: Observable<StoreWithTagsQueryModel[]> =
    combineLatest([this.stores$, this.storesTagIds]).pipe(
      map(([stores, tagIds]) => this.mapToStoreQuery(stores, tagIds))
    );

  readonly fruitsAndVegetables$: Observable<ProductModel[]> =
    this._productService.getAll().pipe(
      map((products) =>
        products
          .filter((product) => product.categoryId === '5')
          .sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            if (a.featureValue < b.featureValue) return 1;
            return 0;
          })
          .slice(0, 5)
      )
    );

  readonly snackAndMunchies$: Observable<ProductModel[]> = this._productService
    .getAll()
    .pipe(
      map((products) =>
        products
          .filter((product) => product.categoryId === '2')
          .sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            if (a.featureValue < b.featureValue) return 1;
            return 0;
          })
          .slice(0, 5)
      )
    );

  constructor(
    private _categoryService: CategoryService,
    private _storeService: StoreService,
    private _productService: ProductService
  ) {}

  mapToStoreQuery(
    stores: StoreModel[],
    tagIds: StoreTagIdModel[]
  ): StoreWithTagsQueryModel[] {
    const tagMap = tagIds.reduce(
      (a, c) => ({ ...a, [c.id]: c }),
      {} as Record<string, StoreTagIdModel>
    );

    return stores.map((store) => ({
      name: store.name,
      logoUrl: store.logoUrl,
      distance: Math.round(store.distanceInMeters / 100) / 10,
      storeCategories: (store.tagIds ?? []).map((tagid) => tagMap[tagid]?.name),
      id: store.id,
    }));
  }
}
