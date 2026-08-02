import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketUpdateRequest } from '../../../models/ticket';
import { TicketCategory } from '../../../models/ticket-category';
import { User } from '../../../models/user';
import { TicketService } from '../../../services/ticket.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { TicketCategoryService } from '../../../services/ticket-category.service';
import { ToastService } from '../../../services/toast.service';

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
    subject: new FormControl('', { nonNullable: true }), description: new FormControl('', { nonNullable: true }),
    status: new FormControl('OPEN', { nonNullable: true }), priority: new FormControl('MEDIUM', { nonNullable: true }),
    assignedToId: new FormControl(0, { nonNullable: true }), categoryId: new FormControl(0, { nonNullable: true }),
  });
  ticketUpdateRequest: TicketUpdateRequest | null = null;
  ticketId = 0;
  errorMessage = '';
  constructor(private readonly ticketService: TicketService, private readonly userService: UserService, private readonly categoryService: TicketCategoryService, private readonly toast: ToastService, private readonly route: ActivatedRoute) {}
  ngOnInit(): void {
    this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getAll().subscribe({ next: (users) => (this.assignees = users), error: () => (this.errorMessage = 'Unable to load assignees.') });
    this.categoryService.getAll().subscribe({ next: (categories) => (this.categories = categories), error: (error) => this.toast.error(error, 'Unable to load ticket categories.') });
    this.ticketService.getById(this.ticketId).subscribe({ next: (ticket) => { this.ticketNumber = ticket.ticketNumber; this.ticketSubject = ticket.subject; this.ticketForm.patchValue(ticket); }, error: (error) => this.toast.error(error, 'Unable to load ticket.') });
  }

  onUpdate(): void {
    const value = this.ticketForm.getRawValue();
    this.ticketUpdateRequest = { ...value, assignedToId: Number(value.assignedToId), categoryId: Number(value.categoryId) };
    this.ticketService.update(this.ticketId, this.ticketUpdateRequest).subscribe({
      next: (ticket) => { this.ticketNumber = ticket.ticketNumber; this.ticketSubject = ticket.subject; this.toast.success(`Ticket ${ticket.ticketNumber} updated successfully.`); },
      error: (error) => this.toast.error(error, 'Unable to update ticket.'),
    });
  }
}
