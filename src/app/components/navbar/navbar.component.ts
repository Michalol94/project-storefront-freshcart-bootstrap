import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoryService.getAllCategories();
  private _showNavSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public showNav$: Observable<boolean> = this._showNavSubject.asObservable();

  constructor(
    private _categoryService: CategoryService,
    private _router: Router
  ) {}
  hideNav(): void {
    this._showNavSubject.next(false);
  }

  showNav(): void {
    this._showNavSubject.next(true);
  }
}
