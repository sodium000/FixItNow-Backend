export interface CreateBookingPayload {
  serviceId: string;
  scheduledAt: Date;
  address: string;
  notes?: string;
}
