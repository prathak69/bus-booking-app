import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
    },
    {
        path: 'search',
        loadComponent: () => import('./pages/search/search').then(m =>m.Search)
    },
    {
        path: 'booking/:id',
        loadComponent : () => import('./pages/booking/booking').then(m=>m.Booking)
    }
];
