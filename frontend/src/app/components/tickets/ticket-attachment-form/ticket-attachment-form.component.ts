import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketAttachmentRequest } from '../../../models/ticket-attachment';

@Component({
  selector: 'app-ticket-attachment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-attachment-form.component.html',
  styleUrl: './ticket-attachment-form.component.scss',
})
export class TicketAttachmentFormComponent {
  readonly attachmentForm = new FormGroup({
    fileName: new FormControl('', { nonNullable: true }),
    filePath: new FormControl('', { nonNullable: true }),
    fileSize: new FormControl(0, { nonNullable: true }),
    ticketId: new FormControl(0, { nonNullable: true }),
    uploadedById: new FormControl(0, { nonNullable: true }),
  });

  attachmentRequest: TicketAttachmentRequest | null = null;

  onSave(): void {
    const value = this.attachmentForm.getRawValue();
    this.attachmentRequest = {
      ...value,
      fileSize: Number(value.fileSize),
      ticketId: Number(value.ticketId),
      uploadedById: Number(value.uploadedById),
    };
  }
}
