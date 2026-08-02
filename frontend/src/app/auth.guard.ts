import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) return router.createUrlTree(['/login']);
  const roles = (route.data?.['roles'] as string[] | undefined) ?? [];
  if (roles.length === 0 || (authService.getRole() && roles.includes(authService.getRole()!))) return true;
  return router.createUrlTree(['/access-denied']);
};
