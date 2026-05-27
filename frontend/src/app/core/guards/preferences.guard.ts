import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const preferencesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.hasCompletedPreferences()) {
    return true;
  }

  return router.createUrlTree(['/preferences']);
};

export const preferencesPageGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (auth.hasCompletedPreferences()) {
    return router.createUrlTree(['/browse']);
  }

  return true;
};
