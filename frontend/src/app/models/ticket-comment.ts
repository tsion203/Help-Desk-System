export interface TicketComment {
  id: number;
  comment: string;
  commentedAt: string;
  ticketId: number;
  userId: number;
  userName: string;
}

export type TicketCommentRequest = Pick<TicketComment, 'comment' | 'ticketId' | 'userId'>;
