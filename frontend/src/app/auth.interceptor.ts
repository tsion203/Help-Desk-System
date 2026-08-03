import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from './services/auth.service';
import { ToastService } from './services/toast.service';

let handledExpiredToken: string | null = null;

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = authService.getToken();
  const authorizedRequest = token
    ? request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        (error as HttpErrorResponse & { handledByInterceptor?: boolean }).handledByInterceptor = true;
        if (handledExpiredToken === token) return throwError(() => error);
        handledExpiredToken = token;
        authService.logout();
        toast.info('Your session has expired. Please sign in again.');
        if (router.url.split('?')[0] !== '/login') void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
