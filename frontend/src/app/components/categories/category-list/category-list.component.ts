import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TicketCategory } from '../../../models/ticket-category';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-category-list', standalone: true, imports: [CommonModule, RouterLink], templateUrl: './category-list.component.html' })
export class CategoryListComponent implements OnInit {
  categories: TicketCategory[] = []; loading = true;
  constructor(private readonly categoriesService: TicketCategoryService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.categoriesService.getAll().subscribe({ next: (items) => { this.categories = items; this.loading = false; this.cdr.markForCheck(); }, error: (error) => { this.loading = false; this.toast.error(error, 'Unable to load categories.'); this.cdr.markForCheck(); } }); }
  deleteCategory(id: number, event: Event): void { event.stopPropagation(); this.categoriesService.delete(id).subscribe({ next: () => { this.categories = this.categories.filter((item) => item.id !== id); this.toast.success('Category deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete category.') }); }
}
