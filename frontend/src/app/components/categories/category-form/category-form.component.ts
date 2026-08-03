import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { ToastService } from '../../../services/toast.service';

@Component({ selector: 'app-category-form', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './category-form.component.html' })
export class CategoryFormComponent implements OnInit {
  categoryId: number | null = null;
  readonly categoryForm = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: [Validators.required] }), description: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  constructor(private readonly categories: TicketCategoryService, private readonly toast: ToastService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); if (id) { this.categoryId = id; this.categories.getById(id).subscribe({ next: (category) => this.categoryForm.patchValue(category), error: (error) => this.toast.error(error, 'Unable to load category.') }); } }
  get pageTitle(): string { return this.categoryId ? 'Edit category' : 'New category'; }
  onSave(): void { if (this.categoryForm.invalid) { this.categoryForm.markAllAsTouched(); this.toast.error(null, 'Please fill in all required fields.'); return; } const value = this.categoryForm.getRawValue(); const request = this.categoryId ? this.categories.update(this.categoryId, value) : this.categories.create(value); request.subscribe({ next: () => { if (!this.categoryId) this.categoryForm.reset({ name: '', description: '' }); this.toast.success(this.categoryId ? 'Category updated successfully.' : 'Category created successfully.'); }, error: (error) => this.toast.error(error, 'Unable to save category.') }); }
}
