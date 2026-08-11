import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketUpdateRequest } from '../../../models/ticket';
import { TicketCategory } from '../../../models/ticket-category';
import { User } from '../../../models/user';
import { TicketService } from '../../../services/ticket.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-ticket-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-update.component.html',
  styleUrl: './ticket-update.component.scss',
})
export class TicketUpdateComponent implements OnInit {
  ticketNumber = '';
  ticketSubject = '';
  categories: TicketCategory[] = [];
  assignees: User[] = [];
  readonly ticketForm = new FormGroup({
    subject: new FormControl('', { nonNullable: true, validators: [Validators.required] }), description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl('OPEN', { nonNullable: true }), priority: new FormControl('MEDIUM', { nonNullable: true }),
    assignedToId: new FormControl(0, { nonNullable: true }), categoryId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
  });
  ticketUpdateRequest: TicketUpdateRequest | null = null;
  ticketId = 0;
  errorMessage = '';
  constructor(private readonly ticketService: TicketService, private readonly userService: UserService, private readonly categoryService: TicketCategoryService, private readonly toast: ToastService, private readonly route: ActivatedRoute, private readonly router: Router, private readonly authService: AuthService, private readonly cdr: ChangeDetectorRef) {}
  get canAssign(): boolean { return this.authService.isAdmin() || this.authService.isSupervisor(); }
  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.canAssign) this.userService.getAll().subscribe({ next: (users) => { this.assignees = users; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load assignees.'; this.cdr.markForCheck(); } });
    this.categoryService.getAll().subscribe({ next: (categories) => { this.categories = categories; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load ticket categories.') });
    this.ticketService.getById(this.ticketId).subscribe({ next: (ticket) => { this.ticketNumber = ticket.ticketNumber; this.ticketSubject = ticket.subject; this.ticketForm.patchValue(ticket); this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load ticket.') });
  }

  onUpdate(): void {
    if (this.ticketForm.controls.categoryId.invalid) {
      this.ticketForm.markAllAsTouched();
      this.toast.error(null, 'Please select a ticket category.');
      return;
    }
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      this.toast.error(null, 'Please fill in all required fields.');
      return;
    }
    const value = this.ticketForm.getRawValue();
    this.ticketUpdateRequest = {
      subject: value.subject,
      description: value.description,
      status: value.status,
      priority: value.priority,
      categoryId: Number(value.categoryId),
      ...(this.canAssign ? { assignedToId: Number(value.assignedToId) } : {}),
    };
    this.ticketService.update(this.ticketId, this.ticketUpdateRequest).subscribe({
      next: (ticket) => {
        this.ticketNumber = ticket.ticketNumber;
        this.ticketSubject = ticket.subject;
        this.toast.success(`Ticket ${ticket.ticketNumber} updated successfully.`);
        void this.router.navigate(['/tickets', ticket.id]);
      },
      error: (error) => this.toast.error(error, 'Unable to update ticket.'),
    });
  }
}
