// Vehicle model
export interface Vehicle {
  id: string;
  userId: string;
  customerId: string;
  make: string;
  model: string;
  year: number | null;
  licensePlate: string;
  vin: string | null;
  color: string | null;
  notes: string | null;
  createdAt: Date;
  // Denormalized customer info for display
  customerName?: string;
}

export interface CreateVehicleInput {
  customerId: string;
  make: string;
  model: string;
  year?: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  notes?: string;
}

export interface UpdateVehicleInput {
  make?: string;
  model?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  color?: string;
  notes?: string;
}

export function getVehicleDisplayName(vehicle: Vehicle): string {
  const parts = [vehicle.make, vehicle.model];
  if (vehicle.year) {
    parts.push(`(${vehicle.year})`);
  }
  return parts.join(' ');
}

export function getVehicleFullDescription(vehicle: Vehicle): string {
  const parts = [vehicle.make, vehicle.model];
  if (vehicle.year) {
    parts.push(vehicle.year.toString());
  }
  if (vehicle.color) {
    parts.push(`- ${vehicle.color}`);
  }
  return parts.join(' ');
}
