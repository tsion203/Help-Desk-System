export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  recipientId: number;
  recipientName: string;
  ticketId: number | null;
  ticketNumber: string | null;
  createdAt: string;
  isRead: boolean;
}
