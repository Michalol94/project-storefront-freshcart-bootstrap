import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  map,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { CategoryModel } from '../../models/category.model';
import { ProductModel } from '../../models/product.model';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

interface Pagination {
  pageSize: number;
  pageNumber: number;
}

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {
  private _paginationSubject: BehaviorSubject<Pagination> =
    new BehaviorSubject<Pagination>({ pageSize: 5, pageNumber: 1 });

  public pagination$: Observable<Pagination> =
    this._paginationSubject.asObservable();

  readonly limitProducts$: Observable<number[]> = of([5, 10, 15]);

  readonly sort: FormControl = new FormControl('Featured');

  readonly filterLow: FormControl = new FormControl();
  readonly filterHigh: FormControl = new FormControl();

  readonly filterByLow$: Observable<string> = this.filterLow.valueChanges.pipe(
    debounceTime(1000),
    startWith('1'),
    map((form) => (form ? form : ''))
  );

  readonly filterByHigh$: Observable<string> =
    this.filterHigh.valueChanges.pipe(
      debounceTime(1000),
      startWith('200'),
      map((form) => (form ? form : ''))
    );

  readonly categories$: Observable<CategoryModel[]> =
    this._categoryService.getAllCategories();

  readonly categoryId$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['categoryId'])
  );

  readonly category$: Observable<CategoryModel> = this.categoryId$.pipe(
    switchMap((id) => this._categoryService.getOnecategory(id))
  );

  readonly sort$: Observable<string> = this.sort.valueChanges.pipe(
    startWith(this.sort.value)
  );

  readonly categoryProducts$: Observable<ProductModel[]> = combineLatest([
    this.categoryId$,
    this._productService.getAll(),
  ]).pipe(
    map(([categoryId, products]) =>
      products.filter((product) => product.categoryId === categoryId)
    ),
    shareReplay(1)
  );

  readonly filteredAndSortedProducts$: Observable<ProductModel[]> =
    combineLatest([
      this.categoryProducts$,
      this.sort$,
      this.filterLow.valueChanges.pipe(debounceTime(1000), startWith('1')),
      this.filterHigh.valueChanges.pipe(debounceTime(1000), startWith('200')),
    ]).pipe(
      map(([products, sort, filterLow, filterHigh]) => {
        const prods: ProductModel[] = products
          .filter((product) =>
            filterLow ? product.price >= parseInt(filterLow) : product
          )
          .filter((product) =>
            filterHigh ? product.price <= parseInt(filterHigh) : product
          );
        if (sort === 'Featured')
          return prods.sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            if (a.featureValue < b.featureValue) return 1;
            return 0;
          });
        if (sort === 'Price: Low to High')
          return prods.sort((a, b) => {
            if (a.price > b.price) return 1;
            if (a.price < b.price) return -1;
            return 0;
          });
        if (sort === 'Price: High to Low')
          return prods.sort((a, b) => {
            if (a.price > b.price) return -1;
            if (a.price < b.price) return 1;
            return 0;
          });
        if (sort === 'Avg. Rating')
          return prods.sort((a, b) => {
            if (a.ratingValue > b.ratingValue) return 1;
            if (a.ratingValue < b.ratingValue) return -1;
            return 0;
          });
        return prods;
      }),
      shareReplay(1)
    );

  readonly slicedProducts$: Observable<ProductModel[]> = combineLatest([
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
    this.categoryProducts$,
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

  selectOptions$: Observable<string[]> = of([
    'Featured',
    'Price: Low to High',
    'Price: High to Low',
    'Avg. Rating',
  ]);

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
}
