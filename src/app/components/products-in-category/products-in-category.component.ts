import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';

import { StarsRatingQueryModel } from '../../models/stars-rating-query.model';
import { SortProductsQueryModel } from '../../models/sort-products-query.model';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { ProductsQueryModel } from '../../models/products-query.model';
import { ProductModel } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { StoreService } from '../../services/store.service';

interface Pagination {
  pageSize: number;
  pageNumber: number;
}

@Component({
  selector: 'app-products-in-category',
  styleUrls: ['./products-in-category.component.scss'],
  templateUrl: './products-in-category.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsInCategoryComponent {
  private _paginationSubject: BehaviorSubject<Pagination> =
    new BehaviorSubject<Pagination>({ pageSize: 5, pageNumber: 1 });

  public pagination$: Observable<Pagination> =
    this._paginationSubject.asObservable();

  private _sortProductsByStoreSubject: Subject<Set<string>> = new Subject<
    Set<string>
  >();
  public sortProductsByStore$: Observable<Set<string>> =
    this._sortProductsByStoreSubject.asObservable();

  readonly rateOptions: Observable<StarsRatingQueryModel[]> = of([
    { value: 5, stars: this._fillStars(5) },
    { value: 4, stars: this._fillStars(4) },
    { value: 3, stars: this._fillStars(3) },
    { value: 2, stars: this._fillStars(2) },
  ]);

  readonly sortByRating: FormControl = new FormControl();

  readonly sortByStores: FormControl = new FormControl();

  readonly filterLow: FormControl = new FormControl();
  readonly filterHigh: FormControl = new FormControl();

  readonly limitProducts$: Observable<number[]> = of([5, 10, 15]);

  readonly sort: FormControl = new FormControl();

  readonly storesForm: FormGroup = new FormGroup({
    searchedStores: new FormControl(),
    stores: new FormGroup({}),
  });

  readonly sortOrder$: Observable<SortProductsQueryModel[]> = of([
    { label: 'Featured', value: 'featureValue', order: 'desc' },
    { label: 'Price: Low to High', value: 'priceasc', order: 'asc' },
    { label: 'Price: High to Low', value: 'price', order: 'desc' },
    { label: 'Avg. Rating', value: 'ratingValue', order: 'desc' },
  ]);

  readonly categories$: Observable<CategoryModel[]> =
    this._categoryService.getAllCategories();

  readonly category$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((params) =>
        this._categoryService.getOnecategory(params['categoryId'])
      )
    );

  readonly stores$: Observable<StoreModel[]> = combineLatest([
    this.storesForm.valueChanges.pipe(
      map((form) => form.searchedStores),
      debounceTime(500),
      startWith('')
    ),
    this._storeService.getAllStores(),
  ]).pipe(
    map(([search, stores]) =>
      search
        ? stores.filter((store) =>
            store.name.toLowerCase().includes(search.toLowerCase())
          )
        : stores
    ),
    tap((stores) => {
      this._addFormControl(stores);
    })
  );

  public selectedStores$: Observable<string> = combineLatest([
    this.storesForm.valueChanges.pipe(map((form) => form.stores)),
    this._storeService.getAllStores(),
  ]).pipe(
    map(([storesForm, stores]) => {
      return stores
        .filter((store) => storesForm[store.id] === true)
        .map((store) => store.id)
        .sort()
        .join(',');
    })
  );

  readonly filteredAndSortedProducts$: Observable<ProductsQueryModel[]> =
    combineLatest([
      this._activatedRoute.params,
      this._productService.getAll(),
      this.sort.valueChanges.pipe(startWith('priceasc')),
      this.filterLow.valueChanges.pipe(debounceTime(1000), startWith('1')),
      this.filterHigh.valueChanges.pipe(debounceTime(1000), startWith('200')),
      this.sortByRating.valueChanges.pipe(startWith(1)),
      this.selectedStores$,
    ]).pipe(
      map(
        ([
          params,
          products,
          sortForm,
          filterLow,
          filterHigh,
          sortByRating,
          selectedStores,
        ]: [
          Params,
          ProductModel[],
          string,
          string,
          string,
          number,
          string
        ]) => {
          const filteredProducts = products
            .filter((product) => product.categoryId === params['categoryId'])
            .map((product) => ({
              name: product.name,
              price: product.price,
              ratingValue: product.ratingValue,
              ratingCount: product.ratingCount,
              imageUrl: product.imageUrl,
              featureValue: product.featureValue,
              storeIds: product.storeIds,
              id: product.id,
              starsRating: this._fillStars(product.ratingValue),
            }));
          return this._sortProducts(filteredProducts, sortForm)
            .filter((product) =>
              filterLow ? product.price >= parseInt(filterLow) : product
            )
            .filter((product) =>
              filterHigh ? product.price <= parseInt(filterHigh) : product
            )
            .filter((product) =>
              sortByRating ? product.ratingValue >= sortByRating : product
            )
            .filter((product) =>
              selectedStores
                ? product.storeIds.join(',').includes(selectedStores)
                : product
            );
        }
      ),
      shareReplay(1)
    );

  readonly slicedProducts$: Observable<ProductsQueryModel[]> = combineLatest([
    this.filteredAndSortedProducts$,
    this.pagination$,
  ]).pipe(
    map(([products, pagination]) =>
      products.slice(
        (pagination.pageNumber - 1) * pagination.pageSize,
        pagination.pageNumber * pagination.pageSize
      )
    ),
    shareReplay(1)
  );

  readonly updatedPages$: Observable<number[]> = combineLatest([
    this.filteredAndSortedProducts$,
    this.pagination$,
  ]).pipe(
    map(([products, pagination]) => {
      const max: number = Math.ceil(products.length / pagination.pageSize);
      const updatedPages: number[] = [1];
      for (
        let i = Math.max(2, pagination.pageNumber - 1);
        i <= Math.min(max - 1, pagination.pageNumber + 1);
        i++
      ) {
        updatedPages.push(i);
      }
      if (max > 1) {
        updatedPages.push(max);
      }
      return updatedPages;
    })
  );

  constructor(
    private _categoryService: CategoryService,
    private _activatedRoute: ActivatedRoute,
    private _productService: ProductService,
    private _storeService: StoreService
  ) {}

  changePageLimit(pageSize: number): void {
    this._paginationSubject.next({
      ...this._paginationSubject.value,
      pageSize,
      pageNumber: 1,
    });
  }
  changePageNumber(pageNumber: number): void {
    this._paginationSubject.next({
      ...this._paginationSubject.value,
      pageNumber,
    });
  }

  private _sortProducts(
    products: ProductsQueryModel[],
    sortOrder: string
  ): ProductsQueryModel[] {
    if (sortOrder.includes('asc')) {
      return products.sort((a, b) => (a.price > b.price ? 1 : -1));
    }
    return products.sort((a: Record<string, any>, b: Record<string, any>) =>
      a[sortOrder] > b[sortOrder] ? -1 : 1
    );
  }

  private _fillStars(val: number) {
    const startArray = new Array();
    let i = 1;
    for (i; i <= val; i++) {
      startArray.push(1);
    }

    if (val - startArray.length >= 0.5) {
      startArray.push(0.5);
    }

    for (i; startArray.length < 5; i++) {
      startArray.push(0);
    }

    return startArray;
  }

  private _addFormControl(stores: StoreModel[]) {
    const group: FormGroup = this.storesForm.get('stores') as FormGroup;
    stores.forEach((store) =>
      group.addControl(store.id, new FormControl(false))
    );
  }
}
