import { Routes } from '@angular/router';
import { authGuard, noAuthGaurd } from './guard/auth-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        canActivate: [noAuthGaurd],
        loadComponent: () => import('./pages/auth/auth').then(m => m.Auth)
    },
    {
        path: 'search',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/search/search').then(m =>m.Search)
    },
    {
        path: 'booking/:id',
        canActivate: [authGuard],
        loadComponent : () => import('./pages/booking/booking').then(m=>m.Booking)
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
