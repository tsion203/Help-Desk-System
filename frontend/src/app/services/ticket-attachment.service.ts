import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TicketAttachment } from '../models/ticket-attachment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketAttachmentService {
  private readonly apiUrl = `${environment.apiUrl}/ticket-attachments`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<TicketAttachment[]> {
    return this.http.get<TicketAttachment[]>(this.apiUrl);
  }

  getById(id: number): Observable<TicketAttachment> {
    return this.http.get<TicketAttachment>(`${this.apiUrl}/${id}`);
  }

  create(attachment: TicketAttachment): Observable<TicketAttachment> {
    return this.http.post<TicketAttachment>(this.apiUrl, attachment);
  }

  update(id: number, attachment: TicketAttachment): Observable<TicketAttachment> {
    return this.http.put<TicketAttachment>(`${this.apiUrl}/${id}`, attachment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
