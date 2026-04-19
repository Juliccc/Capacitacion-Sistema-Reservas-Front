import { Reservation } from '../model/reservation.model';

export interface MesAgenda {
  year: number;
  month: number;
  etiqueta: string;
  total: number;
}

function capitalizarPrimeraLetra(texto: string): string {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function agruparReservasPorMes(
  reservas: Reservation[],
): MesAgenda[] {
  const conteo = new Map<string, number>();
  for (const r of reservas) {
    if (!r.date || r.date.length < 7) continue;
    const clave = r.date.slice(0, 7);
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }
  const ordenadas = [...conteo.keys()].sort((a, b) => b.localeCompare(a));
  const formateador = new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
  });
  return ordenadas.map((clave) => {
    const [anio, mes] = clave.split('-').map(Number);
    const etiqueta = capitalizarPrimeraLetra(
      formateador.format(new Date(anio, mes - 1, 1)),
    );
    return {
      year: anio,
      month: mes,
      etiqueta,
      total: conteo.get(clave)!,
    };
  });
}

export function reservasDelMes(
  reservas: Reservation[],
  year: number,
  month: number,
): Reservation[] {
  return reservas
    .filter((r) => {
      if (!r.date || r.date.length < 10) return false;
      const [y, m] = r.date.split('-').map(Number);
      return y === year && m === month;
    })
    .sort((a, b) => {
      const porFecha = a.date.localeCompare(b.date);
      return porFecha !== 0 ? porFecha : a.time.localeCompare(b.time);
    });
}

export function esMesValido(year: number, month: number): boolean {
  if (!Number.isInteger(year) || year < 1970 || year > 2100) return false;
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  return true;
}

export function etiquetaMes(year: number, month: number): string {
  const formateador = new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
  });
  const texto = formateador.format(new Date(year, month - 1, 1));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
