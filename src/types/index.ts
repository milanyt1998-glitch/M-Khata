export type Language = 'en' | 'hi' | 'bn';

export type TransactionType = 'UDHAAR' | 'JAMA'; // UDHAAR = You Gave (Credit), JAMA = You Got (Payment Received)

export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';

export interface Transaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO string
  description: string;
  billNumber?: string;
  paymentMode: PaymentMode;
  billPhotoUrl?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  upiId: string;
  address: string;
  currencySymbol: string;
}

export interface UserSession {
  mobile: string;
  name: string;
  isLoggedIn: boolean;
  token?: string;
}

export type ActiveTab = 'home' | 'customers' | 'reports' | 'settings';
