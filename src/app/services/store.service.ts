import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoreModel } from '../models/store.model';
import { StoreTagIdModel } from '../models/store-tag-id.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  constructor(private _httpClient: HttpClient) {}

  getAllStores(): Observable<StoreModel[]> {
    return this._httpClient.get<StoreModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores'
    );
  }

  getAllStoreTags(): Observable<StoreTagIdModel[]> {
    return this._httpClient.get<StoreTagIdModel[]>(
      'https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-store-tags'
    );
  }

  getOneStore(storeId: string): Observable<StoreModel> {
    return this._httpClient.get<StoreModel>(
      `https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores/${storeId}`
    );
  }
}
