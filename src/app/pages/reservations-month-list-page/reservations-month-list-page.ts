import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Reservation } from '../../model/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import {
  MesAgenda,
  agruparReservasPorMes,
} from '../../utils/reservation-months';

@Component({
  selector: 'app-reservations-month-list-page',
  imports: [RouterLink],
  templateUrl: './reservations-month-list-page.html',
  styleUrl: './reservations-month-list-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsMonthListPage {
  private readonly reservationService = inject(ReservationService);
  private readonly destroyRef = inject(DestroyRef);
  private loadSubscription?: Subscription;

  readonly meses = signal<MesAgenda[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
    this.destroyRef.onDestroy(() => this.loadSubscription?.unsubscribe());
  }

  protected recargar(): void {
    this.error.set(null);
    this.cargar();
  }

  private cargar(): void {
    this.loadSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    this.loadSubscription = this.reservationService.obtenerTodas().subscribe({
      next: (filas: Reservation[]) => {
        this.meses.set(agruparReservasPorMes(filas));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las reservas.');
        this.loading.set(false);
      },
    });
  }
}
