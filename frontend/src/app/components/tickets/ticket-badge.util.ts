export function ticketStatusBadge(status: string): string {
  switch (status) {
    case 'OPEN': case 'REOPENED': return 'status-open';
    case 'ASSIGNED': case 'IN_PROGRESS': case 'PENDING': return 'status-progress';
    case 'RESOLVED': return 'status-resolved';
    case 'CLOSED': return 'status-closed';
    default: return 'status-open';
  }
}

export function ticketPriorityBadge(priority: string): string {
  switch (priority) {
    case 'LOW': return 'priority-low';
    case 'MEDIUM': return 'priority-medium';
    case 'HIGH': return 'priority-high';
    case 'CRITICAL': return 'priority-critical';
    default: return 'priority-medium';
  }
}
