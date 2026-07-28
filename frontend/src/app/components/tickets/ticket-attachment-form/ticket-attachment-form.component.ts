import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketAttachmentRequest } from '../../../models/ticket-attachment';
import { TicketAttachment } from '../../../models/ticket-attachment';
import { TicketAttachmentService } from '../../../services/ticket-attachment.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ticket-attachment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-attachment-form.component.html',
  styleUrl: './ticket-attachment-form.component.scss',
})
export class TicketAttachmentFormComponent implements OnInit {
  readonly attachmentForm = new FormGroup({
    fileName: new FormControl('', { nonNullable: true }),
    filePath: new FormControl('', { nonNullable: true }),
    fileSize: new FormControl(0, { nonNullable: true }),
    ticketId: new FormControl(0, { nonNullable: true }),
    uploadedById: new FormControl(0, { nonNullable: true }),
  });

  attachmentRequest: TicketAttachmentRequest | null = null;
  savedAttachment: TicketAttachment | null = null;
  errorMessage = '';

  constructor(private readonly attachmentService: TicketAttachmentService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    const ticketId = Number(this.route.snapshot.paramMap.get('id'));
    if (ticketId) this.attachmentForm.patchValue({ ticketId });
  }

  onSave(): void {
    const value = this.attachmentForm.getRawValue();
    this.attachmentRequest = {
      ...value,
      fileSize: Number(value.fileSize),
      ticketId: Number(value.ticketId),
      uploadedById: Number(value.uploadedById),
    };
    this.attachmentService.create(this.attachmentRequest).subscribe({
      next: (attachment) => (this.savedAttachment = attachment),
      error: () => (this.errorMessage = 'Unable to save attachment.'),
    });
  }
}
