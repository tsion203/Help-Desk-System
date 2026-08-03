import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketRequest } from '../../../models/ticket';
import { TicketCategory } from '../../../models/ticket-category';
import { User } from '../../../models/user';
import { TicketService } from '../../../services/ticket.service';
import { UserService } from '../../../services/user.service';
import { Ticket } from '../../../models/ticket';
import { AuthService } from '../../../services/auth.service';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.scss',
})
export class TicketFormComponent implements OnInit {
  categories: TicketCategory[] = [];
  users: User[] = [];
  createdTicket: Ticket | null = null;
  errorMessage = '';

  constructor(private readonly ticketService: TicketService, private readonly userService: UserService, private readonly authService: AuthService, private readonly categoryService: TicketCategoryService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}

  get isAdmin(): boolean { return this.authService.isAdmin(); }
  get requesterEmail(): string { return this.authService.getEmail(); }

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({ next: (categories) => { this.categories = categories; this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to load ticket categories.') });
    if (this.isAdmin) this.userService.getAll().subscribe({
      next: (users) => { this.users = users; this.cdr.markForCheck(); },
      error: (error) => this.toast.error(error, 'Unable to load users.'),
    });
  }
  readonly ticketForm = new FormGroup({
    subject: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl('OPEN', { nonNullable: true }),
    priority: new FormControl('MEDIUM', { nonNullable: true }),
    createdById: new FormControl(0, { nonNullable: true }),
    assignedToId: new FormControl(0, { nonNullable: true }),
    categoryId: new FormControl(0, { nonNullable: true, validators: [Validators.min(1)] }),
  });

  ticketRequest: TicketRequest | null = null;

  onCreate(): void {
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
    this.ticketRequest = {
      ...value,
      createdById: Number(value.createdById),
      assignedToId: Number(value.assignedToId),
      categoryId: Number(value.categoryId),
    };
    this.ticketService.create(this.ticketRequest).subscribe({
      next: (ticket) => {
        this.createdTicket = ticket;
        this.ticketForm.reset({ subject: '', description: '', status: 'OPEN', priority: 'MEDIUM', createdById: 0, assignedToId: 0, categoryId: 0 });
        this.toast.success(`Ticket ${ticket.ticketNumber} created successfully.`);
      },
      error: (error) => this.toast.error(error, 'Unable to create ticket.'),
    });
  }
}
