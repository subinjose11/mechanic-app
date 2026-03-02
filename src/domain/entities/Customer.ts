export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: Date;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export function getCustomerDisplayName(customer: Customer): string {
  return customer.name;
}

export function getCustomerContactInfo(customer: Customer): string {
  if (customer.phone) return customer.phone;
  if (customer.email) return customer.email;
  return 'No contact info';
}
