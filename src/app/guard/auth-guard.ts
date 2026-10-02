import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../service/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const vendorAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.currentUser()?.role == 'Vendor') {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const noAuthGaurd: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/search']);
};
