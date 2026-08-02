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
}
