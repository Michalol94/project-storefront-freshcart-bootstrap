import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ProductModel } from 'src/app/models/product.model';
import { ProductsQueryModel } from 'src/app/models/products-query.model';
import { SortProductsQueryModel } from 'src/app/models/sort-products-query.model';
import { ProductService } from 'src/app/services/product.service';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

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

  readonly filterLow: FormControl = new FormControl();
  readonly filterHigh: FormControl = new FormControl();

  readonly limitProducts$: Observable<number[]> = of([5, 10, 15]);

  readonly sort: FormControl = new FormControl();

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

  readonly filteredAndSortedProducts$: Observable<ProductsQueryModel[]> =
    combineLatest([
      this._activatedRoute.params,
      this._productService.getAll(),
      this.sort.valueChanges.pipe(startWith('priceasc')),
      this.filterLow.valueChanges.pipe(debounceTime(1000), startWith('1')),
      this.filterHigh.valueChanges.pipe(debounceTime(1000), startWith('200')),
    ]).pipe(
      map(
        ([params, products, sortForm, filterLow, filterHigh]: [
          Params,
          ProductModel[],
          string,
          string,
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
    private _productService: ProductService
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
    const startArray = new Array(5);
    let i = 1;
    for (i; i <= val; i++) {
      startArray.push(1);
    }

    if (val - startArray.length >= 0.5) {
      startArray.push(0.5);
    }

    if (startArray.length < 5) {
      startArray.push(0);
    }
    return startArray;
  }
}
