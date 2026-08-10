import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../models/page';

import { Role, RoleRequest } from '../models/role';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly apiUrl = `${environment.apiUrl}/roles`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Role[]> {
    return this.getPage({size:1000}).pipe(map((page)=>page.content));
  }
  getPage(request:PageRequest={}):Observable<PageResponse<Role>> { const params=new HttpParams().set('page',request.page??0).set('size',request.size??5).set('sort',request.sort??'name,asc'); return this.http.get<PageResponse<Role>>(this.apiUrl,{params}); }

  getById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  create(role: RoleRequest): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  update(id: number, role: RoleRequest): Observable<Role> { return this.http.put<Role>(`${this.apiUrl}/${id}`, role); }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
