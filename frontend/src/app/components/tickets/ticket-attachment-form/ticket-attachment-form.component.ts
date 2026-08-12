import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TicketAttachmentRequest } from '../../../models/ticket-attachment';
import { TicketAttachment } from '../../../models/ticket-attachment';
import { TicketAttachmentService } from '../../../services/ticket-attachment.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-ticket-attachment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-attachment-form.component.html',
  styleUrl: './ticket-attachment-form.component.scss',
})
export class TicketAttachmentFormComponent implements OnInit {
  @Input() ticketId = 0;
  @Output() attachmentUploaded = new EventEmitter<TicketAttachment>();
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
  selectedFile: File | null = null;
  uploading = false;

  constructor(
    private readonly attachmentService: TicketAttachmentService,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const routeTicketId = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketId = this.ticketId || routeTicketId;
    if (this.ticketId) this.attachmentForm.patchValue({ ticketId: this.ticketId });
    this.userService.getCurrentProfile().subscribe({
      next: (user) => {
        this.attachmentForm.patchValue({ uploadedById: user.id });
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to identify the current user.';
        this.cdr.markForCheck();
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.savedAttachment = null;
    this.errorMessage = '';
    if (this.selectedFile) {
      this.attachmentForm.patchValue({
        fileName: this.selectedFile.name,
        filePath: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        ticketId: this.ticketId,
      });
    }
  }

  clearFile(fileInput: HTMLInputElement): void {
    fileInput.value = '';
    this.selectedFile = null;
    this.attachmentForm.patchValue({ fileName: '', filePath: '', fileSize: 0 });
  }

  onSave(): void {
    if (!this.selectedFile || !this.ticketId || !this.attachmentForm.controls.uploadedById.value) {
      this.errorMessage = 'Select a file before uploading.';
      return;
    }
    const uploadedById = Number(this.attachmentForm.controls.uploadedById.value);
    this.uploading = true;
    this.errorMessage = '';
    this.attachmentService.upload(this.ticketId, uploadedById, this.selectedFile).subscribe({
      next: (attachment) => {
        this.savedAttachment = attachment;
        this.uploading = false;
        this.attachmentUploaded.emit(attachment);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to save attachment.';
        this.uploading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
