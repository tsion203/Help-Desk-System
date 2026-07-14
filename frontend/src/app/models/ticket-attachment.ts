export interface TicketAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
  ticketId: number;
  uploadedById: number;
  uploadedByName: string;
}
