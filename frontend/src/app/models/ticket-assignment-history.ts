export interface TicketAssignmentHistory {
  id: number;
  ticketId: number;
  oldAssigneeId: number;
  oldAssigneeName: string;
  newAssigneeId: number;
  newAssigneeName: string;
  assignedById: number;
  assignedByName: string;
  assignedAt: string;
}
