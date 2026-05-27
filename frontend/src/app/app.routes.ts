import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { preferencesGuard, preferencesPageGuard } from './core/guards/preferences.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'browse', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'preferences',
    canActivate: [preferencesPageGuard],
    loadComponent: () =>
      import('./features/preferences/preferences.component').then((m) => m.PreferencesComponent),
  },
  {
    path: 'browse',
    canActivate: [authGuard, preferencesGuard],
    loadComponent: () =>
      import('./features/browse/browse.component').then((m) => m.BrowseComponent),
  },
  {
    path: 'show/:id',
    canActivate: [authGuard, preferencesGuard],
    loadComponent: () =>
      import('./features/detail/detail.component').then((m) => m.DetailComponent),
  },
  { path: '**', redirectTo: 'browse' },
];
