import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketAttachment } from '../../../models/ticket-attachment';
import { TicketAttachmentService } from '../../../services/ticket-attachment.service';
import { ToastService } from '../../../services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-ticket-attachment-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-attachment-list.component.html',
  styleUrl: './ticket-attachment-list.component.scss',
})
export class TicketAttachmentListComponent implements OnInit, OnChanges {
  @Input() ticketId = 0;
  @Input() items: TicketAttachment[] | null = null;
  @Input() readOnly = false;
  @Output() attachmentDeleted = new EventEmitter<number>();
  attachments: TicketAttachment[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly attachmentService: TicketAttachmentService, private readonly toast: ToastService, private readonly route: ActivatedRoute, private readonly authService: AuthService, private readonly cdr: ChangeDetectorRef, private readonly confirmation: ConfirmationService) {}
  get canDelete(): boolean { return !this.readOnly && (this.authService.isAdmin() || this.authService.isEmployee()); }
  ngOnInit(): void {
    this.ticketId = this.ticketId || Number(this.route.snapshot.paramMap.get('id'));
    if (this.items !== null) { this.setItems(this.items); return; }
    this.loading = true;
    this.attachmentService.getAll().subscribe({ next: (items) => { this.setItems(items); this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load attachments.'; this.loading = false; this.cdr.markForCheck(); } });
  }
  ngOnChanges(changes: SimpleChanges): void { if (changes['items'] && this.items !== null) this.setItems(this.items); }
  async deleteAttachment(id: number): Promise<void> { const item=this.attachments.find(value=>value.id===id); const result=await this.confirmation.confirm({title:'Delete attachment?',message:`Delete ${item?.fileName || 'this attachment'}? This action cannot be undone.`,confirmText:'Delete attachment',danger:true}); if(!result.confirmed)return; this.attachmentService.delete(id).subscribe({ next: () => { this.attachments = this.attachments.filter((item) => item.id !== id); this.attachmentDeleted.emit(id); this.toast.success('Attachment deleted successfully.'); this.cdr.markForCheck(); }, error: (error) => this.toast.error(error, 'Unable to delete attachment.') }); }
  downloadAttachment(attachment: TicketAttachment): void {
    this.attachmentService.download(attachment.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.fileName;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => this.toast.error(error, 'Unable to download attachment.'),
    });
  }
  fileType(attachment: TicketAttachment): string { const extension = attachment.fileName.split('.').pop(); return extension && extension !== attachment.fileName ? extension.toUpperCase() : 'File'; }
  private setItems(items: TicketAttachment[]): void { this.attachments = this.ticketId ? items.filter((item) => item.ticketId === this.ticketId) : items; }
}
