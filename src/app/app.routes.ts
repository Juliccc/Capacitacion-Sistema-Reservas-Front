import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'reservas' },
  {
    path: 'reservas/nueva',
    loadComponent: () =>
      import('./pages/create-reservation-page/create-reservation-page').then(
        (m) => m.CreateReservationPage,
      ),
  },
  {
    path: 'reservas/:year/:month',
    loadComponent: () =>
      import(
        './pages/reservations-month-detail-page/reservations-month-detail-page'
      ).then((m) => m.ReservationsMonthDetailPage),
  },
  {
    path: 'reservas',
    loadComponent: () =>
      import(
        './pages/reservations-month-list-page/reservations-month-list-page'
      ).then((m) => m.ReservationsMonthListPage),
  },
];
