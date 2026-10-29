import { Customer, Transaction, ShopProfile } from '../types';

export const INITIAL_SHOP_PROFILE: ShopProfile = {
  businessName: 'Sharma Kirana & Hardware',
  ownerName: 'Ramesh Sharma',
  phone: '9876543210',
  upiId: 'sharma.store@okaxis',
  address: 'Shop 14, Main Bazaar, Chandni Chowk, Delhi - 110006',
  currencySymbol: '₹',
};

// Generate relative dates for realistic timeliness
const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const daysAgo = (d: number, h = 10) => {
  const date = new Date(now.getTime() - d * 24 * 3600 * 1000);
  date.setHours(h, 30, 0, 0);
  return date.toISOString();
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ramesh Kumar (Electrician)',
    phone: '9811234567',
    address: 'Gali No. 4, Old Delhi',
    notes: 'Regular customer. Buys wiring and sockets on 15-day credit cycle.',
    createdAt: daysAgo(30),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'cust-2',
    name: 'Suresh Gupta (Contractor)',
    phone: '9822345678',
    address: 'Sector 15, Rohini',
    notes: 'Site supervisor at Royal Enclave. Large purchases for cement & paint.',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(1, 14),
  },
  {
    id: 'cust-3',
    name: 'Sunita Devi (Kirana Regular)',
    phone: '9833456789',
    address: 'House #22, Nai Basti',
    notes: 'Monthly ration customer. Always clears balance on 1st of month.',
    createdAt: daysAgo(60),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'cust-4',
    name: 'Amitabh Roy (Bakery)',
    phone: '9844567890',
    address: 'Near Metro Gate 2, Kashmere Gate',
    notes: 'Bakery supplier. Takes sugar and maida in bulk.',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(3, 11),
  },
  {
    id: 'cust-5',
    name: 'Md. Imran Ali',
    phone: '9855678901',
    address: 'Basti Hazrat Nizamuddin',
    notes: 'Plumber. Settles up weekly via GPay.',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(2, 16),
  },
  {
    id: 'cust-6',
    name: 'Pooja Verma',
    phone: '9866789012',
    address: 'Flat 402, Shanti Kunj Apartments',
    notes: 'Advance deposited for Diwali paint supplies.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1, 17),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Ramesh Kumar (Total: 4200 - 2000 = 2200 Udhaar)
  {
    id: 'tx-101',
    customerId: 'cust-1',
    type: 'UDHAAR',
    amount: 2800,
    date: daysAgo(7, 11),
    description: 'Havells 2.5mm copper wire 2 bundles + 6 modular switches',
    billNumber: 'INV-2041',
    paymentMode: 'CASH',
    createdAt: daysAgo(7, 11),
  },
  {
    id: 'tx-102',
    customerId: 'cust-1',
    type: 'JAMA',
    amount: 2000,
    date: daysAgo(4, 15),
    description: 'Received via PhonePe UPI',
    paymentMode: 'UPI',
    createdAt: daysAgo(4, 15),
  },
  {
    id: 'tx-103',
    customerId: 'cust-1',
    type: 'UDHAAR',
    amount: 1400,
    date: hoursAgo(3),
    description: 'Finolex casing pipe 10 pcs + MCB distribution box',
    billNumber: 'INV-2089',
    paymentMode: 'CASH',
    createdAt: hoursAgo(3),
  },

  // Suresh Gupta (Total: 15000 + 8500 - 10000 = 13500 Udhaar)
  {
    id: 'tx-201',
    customerId: 'cust-2',
    type: 'UDHAAR',
    amount: 15000,
    date: daysAgo(12, 10),
    description: 'Ultratech Cement 35 bags delivered to site',
    billNumber: 'INV-1994',
    paymentMode: 'BANK_TRANSFER',
    createdAt: daysAgo(12, 10),
  },
  {
    id: 'tx-202',
    customerId: 'cust-2',
    type: 'JAMA',
    amount: 10000,
    date: daysAgo(5, 17),
    description: 'Cheque deposit #401928 cleared',
    paymentMode: 'CHEQUE',
    createdAt: daysAgo(5, 17),
  },
  {
    id: 'tx-203',
    customerId: 'cust-2',
    type: 'UDHAAR',
    amount: 8500,
    date: daysAgo(1, 14),
    description: 'Asian Paints Apex Ultima 20L + Primer 10L',
    billNumber: 'INV-2070',
    paymentMode: 'CASH',
    createdAt: daysAgo(1, 14),
  },

  // Sunita Devi (Total: 3450 - 2500 = 950 Udhaar)
  {
    id: 'tx-301',
    customerId: 'cust-3',
    type: 'UDHAAR',
    amount: 3450,
    date: daysAgo(6, 12),
    description: 'Aashirvaad Atta 10kg, Fortune Mustard Oil 5L, Basmati Rice 5kg, Sugar 3kg',
    billNumber: 'INV-2055',
    paymentMode: 'CASH',
    createdAt: daysAgo(6, 12),
  },
  {
    id: 'tx-302',
    customerId: 'cust-3',
    type: 'JAMA',
    amount: 2500,
    date: hoursAgo(5),
    description: 'Cash payment handed by son',
    paymentMode: 'CASH',
    createdAt: hoursAgo(5),
  },

  // Amitabh Roy (Total: 6500 - 6500 = 0 Settled)
  {
    id: 'tx-401',
    customerId: 'cust-4',
    type: 'UDHAAR',
    amount: 6500,
    date: daysAgo(14, 9),
    description: 'Maida 50kg bag + White Sugar 50kg sack',
    billNumber: 'INV-1980',
    paymentMode: 'CASH',
    createdAt: daysAgo(14, 9),
  },
  {
    id: 'tx-402',
    customerId: 'cust-4',
    type: 'JAMA',
    amount: 6500,
    date: daysAgo(3, 11),
    description: 'Full account settlement via Google Pay',
    paymentMode: 'UPI',
    createdAt: daysAgo(3, 11),
  },

  // Md. Imran Ali (Total: 1800 - 0 = 1800 Udhaar)
  {
    id: 'tx-501',
    customerId: 'cust-5',
    type: 'UDHAAR',
    amount: 1800,
    date: daysAgo(2, 16),
    description: 'CPVC pipes 1 inch, elbows, solvent glue, and brass bib cock',
    billNumber: 'INV-2065',
    paymentMode: 'CASH',
    createdAt: daysAgo(2, 16),
  },

  // Pooja Verma (Total: 0 - 1500 = 1500 Advance / You will give)
  {
    id: 'tx-601',
    customerId: 'cust-6',
    type: 'JAMA',
    amount: 1500,
    date: daysAgo(1, 17),
    description: 'Advance payment for festival waterproof coating order',
    paymentMode: 'UPI',
    createdAt: daysAgo(1, 17),
  },
];
