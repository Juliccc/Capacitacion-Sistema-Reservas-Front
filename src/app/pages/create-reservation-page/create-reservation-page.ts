import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ErrorToast } from '../../components/error-toast/error-toast';
import { SERVICIOS_SOPORTE_TECNICO } from '../../data/servicios-soporte';
import {
  NuevaReserva,
  ReservationService,
} from '../../services/reservation.service';

function mensajeErrorHttp(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) {
        return msg;
      }
    }
    if (typeof err.message === 'string' && err.status !== 0) {
      return err.message;
    }
  }
  return 'No se pudo guardar la reserva. Inténtalo de nuevo.';
}

function normalizarHora(hora: string): string {
  return /^\d{2}:\d{2}$/.test(hora) ? `${hora}:00` : hora;
}

@Component({
  selector: 'app-create-reservation-page',
  imports: [ReactiveFormsModule, RouterLink, ErrorToast],
  templateUrl: './create-reservation-page.html',
  styleUrl: './create-reservation-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateReservationPage {
  private readonly fb = inject(FormBuilder);
  private readonly reservationService = inject(ReservationService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly servicios = SERVICIOS_SOPORTE_TECNICO;

  readonly form = this.fb.nonNullable.group({
    nombreCliente: ['', [Validators.required]],
    fecha: ['', [Validators.required]],
    hora: ['', [Validators.required]],
    servicio: ['', [Validators.required]],
  });

  readonly guardando = signal(false);
  readonly toastError = signal<string | null>(null);

  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.form.statusChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());

    this.destroyRef.onDestroy(() => this.clearToastTimer());
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: NuevaReserva = {
      customerName: v.nombreCliente.trim(),
      date: v.fecha,
      time: normalizarHora(v.hora),
      service: v.servicio,
    };

    this.toastError.set(null);
    this.clearToastTimer();
    this.guardando.set(true);

    this.reservationService
      .crear(payload)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/reservas']),
        error: (err: unknown) => {
          this.toastError.set(mensajeErrorHttp(err));
          this.clearToastTimer();
          this.toastTimer = setTimeout(() => {
            this.toastError.set(null);
            this.cdr.markForCheck();
          }, 8000);
        },
      });
  }

  protected onToastDismissed(): void {
    this.clearToastTimer();
    this.toastError.set(null);
  }

  private clearToastTimer(): void {
    if (this.toastTimer !== undefined) {
      clearTimeout(this.toastTimer);
      this.toastTimer = undefined;
    }
  }
}
