// Spare part model (subcollection of orders)
export interface SparePart {
  id: string;
  serviceOrderId: string;
  partName: string;
  partNumber: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateSparePartInput {
  serviceOrderId: string;
  partName: string;
  partNumber?: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateSparePartInput {
  partName?: string;
  partNumber?: string;
  quantity?: number;
  unitPrice?: number;
}

export function calculatePartTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function createSparePartWithTotal(input: CreateSparePartInput): Omit<SparePart, 'id'> {
  return {
    serviceOrderId: input.serviceOrderId,
    partName: input.partName,
    partNumber: input.partNumber || null,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    total: calculatePartTotal(input.quantity, input.unitPrice),
  };
}
