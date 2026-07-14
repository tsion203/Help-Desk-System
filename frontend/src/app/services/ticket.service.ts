import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Ticket } from '../models/ticket';
import { TicketAssignmentHistory } from '../models/ticket-assignment-history';
import { TicketStatusHistory } from '../models/ticket-status-history';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = `${environment.apiUrl}/tickets`;
  private readonly assignmentHistoryUrl = `${environment.apiUrl}/ticket-assignment-history`;
  private readonly statusHistoryUrl = `${environment.apiUrl}/ticket-status-history`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  create(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket);
  }

  update(id: number, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAssignmentHistory(ticketId: number): Observable<TicketAssignmentHistory[]> {
    return this.http.get<TicketAssignmentHistory[]>(`${this.assignmentHistoryUrl}/ticket/${ticketId}`);
  }

  getStatusHistory(ticketId: number): Observable<TicketStatusHistory[]> {
    return this.http.get<TicketStatusHistory[]>(`${this.statusHistoryUrl}/ticket/${ticketId}`);
  }
}
