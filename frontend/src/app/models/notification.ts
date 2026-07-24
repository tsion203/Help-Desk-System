export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  recipientId: number;
  recipientName: string;
  ticketId: number;
  ticketNumber: string;
  createdAt: string;
  isRead: boolean;
}
