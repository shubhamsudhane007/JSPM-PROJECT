export type Language = 'en' | 'hi' | 'mr';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'sales'
  | 'rent'
  | 'stock purchase'
  | 'salary'
  | 'electricity'
  | 'transport'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  note: string;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:MM
}

export type TrustLevel = 'Pays on time' | 'Sometimes late' | 'Often late';

export interface CreditPaymentHistory {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  itemsTaken: string;
  amountDue: number;
  totalGiven: number;
  dueDate: string;
  lastPaymentDate?: string;
  trustLevel: TrustLevel;
  history?: CreditPaymentHistory[];
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'packet' | 'liter' | 'piece' | 'box' | 'quintal';
  minAlertLevel: number;
  sellingPrice: number;
  costPrice: number;
  isBestSeller?: boolean;
  isSlowMoving?: boolean;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface PriceItem {
  id: string;
  name: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: PricePoint[];
  trend?: 'rising' | 'falling' | 'stable';
  badgeText?: string;
  reason?: string;
  suggestion?: string;
  isBestBuy?: boolean;
}

export interface GeneratedAd {
  id: string;
  timestamp: string;
  shopName: string;
  occasion: string;
  tone: string;
  items: string[];
  posterHeadline: string;
  posterTagline: string;
  offerHighlight: string;
  whatsappMessage: string;
  instagramCaption: string;
  twitterPost: string;
  accentColor: string;
  language: Language;
}

export interface BillItem {
  itemId?: string;
  name: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone?: string;
  items: BillItem[];
  totalAmount: number;
  date: string;
  paymentMode: 'cash' | 'upi' | 'credit';
}

export interface ShopSettings {
  ownerName: string;
  shopName: string;
  tagline: string;
  phone: string;
  address: string;
  upiId: string;
  qrCodeUrl?: string;
  language: Language;
  darkMode: boolean;
  showWelcomeScreenOnLaunch: boolean;
}
