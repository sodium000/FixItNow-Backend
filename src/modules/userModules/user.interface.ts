export enum Role {
  TECHNICIAN = "TECHNICIAN",
  CUSTOMER = "CUSTOMER",
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  isActive: boolean; // Fixed: lowercase 'boolean'
  role: Role; // Fixed: capitalized 'Role'
  technicianProfile?: string;

  
  experienceYrs?: number;
  hourlyRate?: number;
  city?: string;
  address?: string;
}
