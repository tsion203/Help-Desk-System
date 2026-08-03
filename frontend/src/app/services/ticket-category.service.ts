import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TicketCategory } from '../models/ticket-category';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;
  constructor(private readonly http: HttpClient) {}
  getAll(): Observable<TicketCategory[]> { return this.http.get<TicketCategory[]>(this.apiUrl); }
  getById(id: number): Observable<TicketCategory> { return this.http.get<TicketCategory>(`${this.apiUrl}/${id}`); }
  create(category: Omit<TicketCategory, 'id'>): Observable<TicketCategory> { return this.http.post<TicketCategory>(this.apiUrl, category); }
  update(id: number, category: Omit<TicketCategory, 'id'>): Observable<TicketCategory> { return this.http.put<TicketCategory>(`${this.apiUrl}/${id}`, category); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
