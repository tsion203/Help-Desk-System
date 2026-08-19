export interface DashboardTicketActivity {
  id: number;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  updatedAt: string;
}
export interface SupportOfficerOverview {
  id: number;
  name: string;
  email: string;
  assigned: number;
  inProgress: number;
  pending: number;
  resolved: number;
  total: number;
}
export interface DashboardData {
  totalTickets: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  recentActivity: DashboardTicketActivity[];
  supportOfficers: SupportOfficerOverview[];
}
