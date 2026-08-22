import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../models/page';

import { Department, DepartmentRequest } from '../models/department';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly apiUrl = `${environment.apiUrl}/departments`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.getPage({size:1000}).pipe(map((page)=>page.content));
  }
  getPage(request:PageRequest={}):Observable<PageResponse<Department>> { const params=new HttpParams().set('page',request.page??0).set('size',request.size??5).set('sort',request.sort??'name,asc'); return this.http.get<PageResponse<Department>>(this.apiUrl,{params}); }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  create(department: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  update(id: number, department: DepartmentRequest): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  setActive(id: number, active: boolean): Observable<Department> { return this.http.patch<Department>(`${this.apiUrl}/${id}/active`, null, { params: { active } }); }
}
