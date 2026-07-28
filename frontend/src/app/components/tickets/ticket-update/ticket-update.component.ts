import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketUpdateRequest } from '../../../models/ticket';
import { TicketCategory } from '../../../models/ticket-category';
import { User } from '../../../models/user';

@Component({
  selector: 'app-ticket-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-update.component.html',
  styleUrl: './ticket-update.component.scss',
})
export class TicketUpdateComponent {
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

  onUpdate(): void {
    const value = this.ticketForm.getRawValue();
    this.ticketUpdateRequest = { ...value, assignedToId: Number(value.assignedToId), categoryId: Number(value.categoryId) };
  }
}
