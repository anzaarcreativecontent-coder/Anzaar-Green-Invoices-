
export interface ProductSize {
  id: string;
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  sizes: ProductSize[];
}

export interface InvoiceItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface BusinessSettings {
  name: string;
  logo: string;
  address: string;
  phone: string;
  footerMessage: string;
  defaultDeliveryInsideDhaka: number;
  defaultDeliveryOutsideDhaka: number;
  defaultPaymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank';
  invoicePrefix: string;
  nextInvoiceNumber: number;
  availableSizes: string[];
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  items: InvoiceItem[];
  deliveryType: 'Inside Dhaka' | 'Outside Dhaka';
  deliveryCharge: number;
  advancePayment: number;
  paymentMethod: string;
  transactionId: string;
  discountAmount: number;
  customNote: string;
  subtotal: number;
  total: number;
  due: number;
  thankYouMessage?: string;
}
