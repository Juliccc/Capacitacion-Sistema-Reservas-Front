import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Reservation } from '../model/reservation.model';

export type NuevaReserva = Pick<
  Reservation,
  'customerName' | 'date' | 'time' | 'service'
>;

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/reservas`;

  obtenerTodas(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.baseUrl);
  }

  crear(reserva: NuevaReserva): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, reserva);
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
