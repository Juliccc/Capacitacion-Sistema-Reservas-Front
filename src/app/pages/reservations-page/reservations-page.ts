import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Reservation, ReservationStatus } from '../../model/reservation.model';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-reservations-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './reservations-page.html',
  styleUrl: './reservations-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsPage {
  private readonly reservationService = inject(ReservationService);
  private readonly destroyRef = inject(DestroyRef);
  private loadSubscription?: Subscription;

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly cancellingId = signal<number | null>(null);

  protected readonly ReservationStatus = ReservationStatus;

  constructor() {
    this.load();
    this.destroyRef.onDestroy(() => this.loadSubscription?.unsubscribe());
  }

  protected estadoEtiqueta(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.ACTIVE:
        return 'Activa';
      case ReservationStatus.CANCELED:
        return 'Cancelada';
    }
  }

  protected puedeCancelar(reserva: Reservation): boolean {
    return reserva.status === ReservationStatus.ACTIVE;
  }

  protected cancelar(reserva: Reservation): void {
    this.cancellingId.set(reserva.id);
    this.reservationService
      .cancelar(reserva.id)
      .pipe(finalize(() => this.cancellingId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () =>
          this.error.set('No se pudo cancelar la reserva. Inténtalo de nuevo.'),
      });
  }

  protected recargar(): void {
    this.error.set(null);
    this.load();
  }

  private load(): void {
    this.loadSubscription?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);
    this.loadSubscription = this.reservationService.obtenerTodas().subscribe({
      next: (rows) => {
        this.reservations.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las reservas.');
        this.loading.set(false);
      },
    });
  }
}
