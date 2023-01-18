import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
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

  constructor(
    private _categoryService: CategoryService,
    private _router: Router
  ) {}

  navigateToCategory(categoryId: string): void {
    this._router.navigateByUrl('/categories/' + categoryId);
  }
}
