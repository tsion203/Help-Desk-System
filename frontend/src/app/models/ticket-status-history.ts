export interface TicketStatusHistory {
  id: number;
  ticketId: number;
  oldStatus: string;
  newStatus: string;
  changedById: number;
  changedByName: string;
  changedAt: string;
}
