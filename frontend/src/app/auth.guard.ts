import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const excludedRoles = (route.data?.['excludedRoles'] as string[] | undefined) ?? [];
  if (!authService.hasAnyRole(...excludedRoles) && (roles.length === 0 || authService.hasAnyRole(...roles))) return true;
  return router.createUrlTree(['/access-denied']);
};
