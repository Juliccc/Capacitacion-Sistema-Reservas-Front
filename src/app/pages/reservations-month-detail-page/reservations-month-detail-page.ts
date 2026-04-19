import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { Reservation, ReservationStatus } from '../../model/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import {
  esMesValido,
  etiquetaMes,
  reservasDelMes,
} from '../../utils/reservation-months';

@Component({
  selector: 'app-reservations-month-detail-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './reservations-month-detail-page.html',
  styleUrl: './reservations-month-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationsMonthDetailPage {
  private readonly reservationService = inject(ReservationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly cancellingId = signal<number | null>(null);
  readonly etiquetaPeriodo = signal<string>('');

  protected readonly ReservationStatus = ReservationStatus;

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const year = Number(params.get('year'));
          const month = Number(params.get('month'));
          if (!esMesValido(year, month)) {
            void this.router.navigate(['/reservas']);
            return EMPTY;
          }
          this.etiquetaPeriodo.set(etiquetaMes(year, month));
          this.loading.set(true);
          this.error.set(null);
          return this.reservationService.obtenerTodas().pipe(
            map((filas) => reservasDelMes(filas, year, month)),
            catchError(() => {
              this.error.set('No se pudieron cargar las reservas.');
              return of([] as Reservation[]);
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filas) => this.reservations.set(filas));
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
        next: () => this.recargarMesActual(),
        error: () =>
          this.error.set(
            'No se pudo cancelar la reserva. Inténtalo de nuevo.',
          ),
      });
  }

  protected recargar(): void {
    this.error.set(null);
    this.recargarMesActual();
  }

  private recargarMesActual(): void {
    const snapshot = this.route.snapshot.paramMap;
    const year = Number(snapshot.get('year'));
    const month = Number(snapshot.get('month'));
    if (!esMesValido(year, month)) {
      void this.router.navigate(['/reservas']);
      return;
    }
    this.cancellingId.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.reservationService
      .obtenerTodas()
      .pipe(
        map((filas) => reservasDelMes(filas, year, month)),
        catchError(() => {
          this.error.set('No se pudieron cargar las reservas.');
          return of([] as Reservation[]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((filas) => this.reservations.set(filas));
  }
}
