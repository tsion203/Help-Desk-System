import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketRequest } from '../../../models/ticket';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrl: './ticket-form.component.scss',
})
export class TicketFormComponent {
  readonly ticketForm = new FormGroup({
    subject: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    status: new FormControl('OPEN', { nonNullable: true }),
    priority: new FormControl('MEDIUM', { nonNullable: true }),
    createdById: new FormControl(0, { nonNullable: true }),
    assignedToId: new FormControl(0, { nonNullable: true }),
    categoryId: new FormControl(0, { nonNullable: true }),
  });

  ticketRequest: TicketRequest | null = null;

  onCreate(): void {
    const value = this.ticketForm.getRawValue();
    this.ticketRequest = {
      ...value,
      createdById: Number(value.createdById),
      assignedToId: Number(value.assignedToId),
      categoryId: Number(value.categoryId),
    };
  }
}
