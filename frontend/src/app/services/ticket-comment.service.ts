import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TicketComment } from '../models/ticket-comment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketCommentService {
  private readonly apiUrl = `${environment.apiUrl}/comments`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<TicketComment[]> {
    return this.http.get<TicketComment[]>(this.apiUrl);
  }

  getById(id: number): Observable<TicketComment> {
    return this.http.get<TicketComment>(`${this.apiUrl}/${id}`);
  }

  create(comment: TicketComment): Observable<TicketComment> {
    return this.http.post<TicketComment>(this.apiUrl, comment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
