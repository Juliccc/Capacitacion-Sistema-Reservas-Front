export enum ReservationStatus {
    ACTIVE = 'ACTIVE',
    CANCELED = 'CANCELED',
}

export interface Reservation {
    id: number;
    customerName: string;
    date: string;
    time: string;
    service: string;
    status: ReservationStatus;
}