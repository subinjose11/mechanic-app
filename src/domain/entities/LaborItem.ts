export interface LaborItem {
  id: string;
  serviceOrderId: string;
  description: string;
  hours: number;
  ratePerHour: number;
  total: number;
}

export interface CreateLaborItemInput {
  serviceOrderId: string;
  description: string;
  hours: number;
  ratePerHour: number;
}

export interface UpdateLaborItemInput {
  description?: string;
  hours?: number;
  ratePerHour?: number;
}

export function calculateLaborTotal(hours: number, ratePerHour: number): number {
  return hours * ratePerHour;
}

export function createLaborItemWithTotal(input: CreateLaborItemInput): LaborItem {
  return {
    id: '',
    serviceOrderId: input.serviceOrderId,
    description: input.description,
    hours: input.hours,
    ratePerHour: input.ratePerHour,
    total: calculateLaborTotal(input.hours, input.ratePerHour),
  };
}
