
import { BusinessSettings, Product } from './types';

export const INITIAL_SETTINGS: BusinessSettings = {
  name: "My Online Shop",
  logo: "",
  address: "House 12, Road 5, Dhanmondi, Dhaka",
  phone: "01700000000",
  footerMessage: "আমরা বিক্রিত এবং ব্যাবহিত পণ্য ফেরত নিয়ে থাকি",
  defaultDeliveryInsideDhaka: 60,
  defaultDeliveryOutsideDhaka: 120,
  defaultPaymentMethod: 'Cash',
  invoicePrefix: 'INV-',
  nextInvoiceNumber: 1001,
  availableSizes: ['500gm', '1kg', '2kg', '1L', '2L', '5L', 'Pcs', 'Box', 'Packet'],
};

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Organic Honey', 
    sizes: [
      { id: 's1', label: '500gm', price: 450 },
      { id: 's2', label: '1kg', price: 800 }
    ] 
  },
  { 
    id: '2', 
    name: 'Pure Mustard Oil', 
    sizes: [
      { id: 's3', label: '1L', price: 250 },
      { id: 's4', label: '5L', price: 1200 }
    ] 
  }
];

export const DISTRICTS = [
  "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet", "Barisal", "Rangpur", "Mymensingh",
  "Gazipur", "Narayanganj", "Comilla", "Noakhali", "Bogura", "Kushtia", "Pabna", "Jashore"
];

export const PAYMENT_METHODS = ['Cash', 'bKash', 'Nagad', 'Bank'];
