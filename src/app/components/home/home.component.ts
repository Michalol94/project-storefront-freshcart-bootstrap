import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { StoreTagIdModel } from 'src/app/models/store-tag-id.model';
import { StoreWithTagsQueryModel } from 'src/app/models/store-with-tags-query.model';
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

  constructor(
    private _categoryService: CategoryService,
    private _storeService: StoreService
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
    }));
  }
}
