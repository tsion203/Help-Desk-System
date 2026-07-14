import { TicketAssignmentHistory } from './ticket-assignment-history';
import { TicketAttachment } from './ticket-attachment';
import { TicketComment } from './ticket-comment';
import { TicketStatusHistory } from './ticket-status-history';

export interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string;
  createdById: number;
  createdByName: string;
  assignedToId: number;
  assignedToName: string;
  categoryId: number;
  categoryName: string;
  comments: TicketComment[];
  attachments: TicketAttachment[];
  statusHistory: TicketStatusHistory[];
  assignmentHistory: TicketAssignmentHistory[];
}
