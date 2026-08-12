import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TicketAttachment, TicketAttachmentRequest } from '../models/ticket-attachment';
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

  create(attachment: TicketAttachmentRequest): Observable<TicketAttachment> {
    return this.http.post<TicketAttachment>(this.apiUrl, attachment);
  }

  upload(ticketId: number, uploadedById: number, file: File): Observable<TicketAttachment> {
    const formData = new FormData();
    formData.append('ticketId', String(ticketId));
    formData.append('uploadedById', String(uploadedById));
    formData.append('file', file, file.name);
    return this.http.post<TicketAttachment>(this.apiUrl, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  update(id: number, attachment: TicketAttachmentRequest): Observable<TicketAttachment> {
    return this.http.put<TicketAttachment>(`${this.apiUrl}/${id}`, attachment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
