export interface UpdateTechnicianProfilePayload {
  name?: string;
  phone?: string;
  experienceYrs?: number;
  hourlyRate?: number;
  address?: string;
  city?: string;
}

export interface UpdateTechnicianAvailabilityPayload {
  isAvailable: boolean;
}

export interface UpdateTechnicianBookingStatusPayload {
  status: "ACCEPT" | "DECLINE" | "COMPLETED";
}
