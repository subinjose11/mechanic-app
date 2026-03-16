// User model
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  shopName: string | null;
  shopPhone: string | null;
  shopAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopProfile {
  shopName: string;
  shopPhone: string;
  shopAddress: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export function isShopProfileComplete(user: User): boolean {
  return !!(user.shopName && user.shopPhone && user.shopAddress);
}

export function createEmptyUser(): User {
  return {
    id: '',
    email: '',
    name: null,
    phone: null,
    shopName: null,
    shopPhone: null,
    shopAddress: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
