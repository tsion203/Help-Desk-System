import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PageRequest, PageResponse } from '../models/page';

import { AdminUserUpdateRequest, User, UserProfileUpdateRequest, UserRequest } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getAll(role?: string): Observable<User[]> {
    return this.getPage(role, { size: 1000 }).pipe(map((page) => page.content));
  }
  getPage(role?: string, request:PageRequest={}):Observable<PageResponse<User>> {
    let params=new HttpParams().set('page',request.page??0).set('size',request.size??5).set('sort',request.sort??'firstName,asc'); if(role) params=params.set('role',role);
    return this.http.get<PageResponse<User>>(this.apiUrl,{params});
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: UserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  update(id: number, user: AdminUserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  getCurrentProfile(): Observable<User> { return this.http.get<User>(`${this.apiUrl}/me`); }
  updateCurrentProfile(profile: UserProfileUpdateRequest): Observable<User> { return this.http.put<User>(`${this.apiUrl}/me`, profile); }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
