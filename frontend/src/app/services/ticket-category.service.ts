import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../models/page';
import { TicketCategory } from '../models/ticket-category';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TicketCategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;
  constructor(private readonly http: HttpClient) {}
  getAll(): Observable<TicketCategory[]> { return this.getPage({size:1000}).pipe(map((page)=>page.content)); }
  getPage(request:PageRequest={}):Observable<PageResponse<TicketCategory>> { const params=new HttpParams().set('page',request.page??0).set('size',request.size??5).set('sort',request.sort??'name,asc'); return this.http.get<PageResponse<TicketCategory>>(this.apiUrl,{params}); }
  getById(id: number): Observable<TicketCategory> { return this.http.get<TicketCategory>(`${this.apiUrl}/${id}`); }
  create(category: Omit<TicketCategory, 'id'>): Observable<TicketCategory> { return this.http.post<TicketCategory>(this.apiUrl, category); }
  update(id: number, category: Omit<TicketCategory, 'id'>): Observable<TicketCategory> { return this.http.put<TicketCategory>(`${this.apiUrl}/${id}`, category); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
