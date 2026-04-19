import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reservas' },
  {
    path: 'reservas',
    loadComponent: () =>
      import('./pages/reservations-page/reservations-page').then(
        (m) => m.ReservationsPage,
      ),
  },
  {
    path: 'reservas/nueva',
    loadComponent: () =>
      import('./pages/create-reservation-page/create-reservation-page').then(
        (m) => m.CreateReservationPage,
      ),
  },
];
