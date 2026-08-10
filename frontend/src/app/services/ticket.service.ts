import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, Subject, tap } from 'rxjs';
import { PageRequest, PageResponse } from '../models/page';

import { Ticket, TicketRequest, TicketUpdateRequest } from '../models/ticket';
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
  private readonly ticketsChanged = new Subject<void>();
  readonly ticketsChanged$ = this.ticketsChanged.asObservable();

  constructor(private readonly http: HttpClient) {}

  getAll(filters: TicketFilters = {}): Observable<Ticket[]> {
    return this.getPage(filters, { size: 1000 }).pipe(map((page) => page.content));
  }
  getPage(filters: TicketFilters = {}, pageRequest: PageRequest = {}): Observable<PageResponse<Ticket>> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.priority) params = params.set('priority', filters.priority);
    params=params.set('page',pageRequest.page??0).set('size',pageRequest.size??5).set('sort',pageRequest.sort??'updatedAt,desc');
    return this.http.get<PageResponse<Ticket>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  create(ticket: TicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket).pipe(
      tap(() => this.ticketsChanged.next()),
    );
  }

  update(id: number, ticket: TicketUpdateRequest): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket).pipe(
      tap(() => this.ticketsChanged.next()),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.ticketsChanged.next()),
    );
  }

  getAssignmentHistory(ticketId: number): Observable<TicketAssignmentHistory[]> {
    return this.http.get<TicketAssignmentHistory[]>(`${this.assignmentHistoryUrl}/ticket/${ticketId}`);
  }

  getStatusHistory(ticketId: number): Observable<TicketStatusHistory[]> {
    return this.http.get<TicketStatusHistory[]>(`${this.statusHistoryUrl}/ticket/${ticketId}`);
  }
}

export interface TicketFilters {
  status?: string;
  category?: string;
  priority?: string;
}
