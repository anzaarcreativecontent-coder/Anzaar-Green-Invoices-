
import React, { useState, useEffect, useRef } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BusinessSettings, InvoiceData, Product } from './types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from './constants';
import InvoiceForm from './components/InvoiceForm';
import AdminPanel from './components/AdminPanel';
import InvoicePreview from './components/InvoicePreview';
import { toJpeg } from 'html-to-image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'settings'>('create');
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('beshob_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('beshob_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData>({
    id: Date.now().toString(),
    invoiceNumber: `${settings.invoicePrefix}${settings.nextInvoiceNumber}`,
    date: new Date().toLocaleDateString('en-GB').split('/').join('-'),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    district: 'Dhaka',
    items: [{ id: '1', name: '', size: '', quantity: 1, price: 0 }],
    deliveryType: 'Inside Dhaka',
    deliveryCharge: settings.defaultDeliveryInsideDhaka,
    advancePayment: 0,
    paymentMethod: settings.defaultPaymentMethod,
    transactionId: '',
    discountAmount: 0,
    customNote: '',
    subtotal: 0,
    total: 0,
    due: 0,
    thankYouMessage: '',
  });

  useEffect(() => {
    const subtotal = currentInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = currentInvoice.deliveryType === 'Inside Dhaka' 
      ? settings.defaultDeliveryInsideDhaka 
      : settings.defaultDeliveryOutsideDhaka;
    
    const total = subtotal + deliveryCharge - currentInvoice.discountAmount;
    const due = Math.max(0, total - currentInvoice.advancePayment);

    if (subtotal !== currentInvoice.subtotal || total !== currentInvoice.total || due !== currentInvoice.due || deliveryCharge !== currentInvoice.deliveryCharge) {
        setCurrentInvoice(prev => ({
            ...prev,
            subtotal,
            total,
            due,
            deliveryCharge
        }));
    }
  }, [currentInvoice.items, currentInvoice.deliveryType, currentInvoice.advancePayment, currentInvoice.discountAmount, settings]);

  const handleSettingsUpdate = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    localStorage.setItem('beshob_settings', JSON.stringify(newSettings));
  };

  const handleProductsUpdate = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('beshob_products', JSON.stringify(newProducts));
  };

  const resetInvoice = () => {
    setCurrentInvoice({
      id: Date.now().toString(),
      invoiceNumber: `${settings.invoicePrefix}${settings.nextInvoiceNumber}`,
      date: new Date().toLocaleDateString('en-GB').split('/').join('-'),
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      district: 'Dhaka',
      items: [{ id: '1', name: '', size: '', quantity: 1, price: 0 }],
      deliveryType: 'Inside Dhaka',
      deliveryCharge: settings.defaultDeliveryInsideDhaka,
      advancePayment: 0,
      paymentMethod: settings.defaultPaymentMethod,
      transactionId: '',
      discountAmount: 0,
      customNote: '',
      subtotal: 0,
      total: 0,
      due: 0,
      thankYouMessage: '',
    });
  };

  const handlePrint = () => {
    window.print();
    const nextNum = settings.nextInvoiceNumber + 1;
    handleSettingsUpdate({ ...settings, nextInvoiceNumber: nextNum });
  };

  const downloadJPG = async () => {
    if (previewRef.current === null) return;
    const dataUrl = await toJpeg(previewRef.current, { quality: 0.95, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `Invoice-${currentInvoice.invoiceNumber}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">InvoicePro</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Riaz Solutions</p>
              </div>
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
              <button onClick={() => setActiveTab('create')} className={`px-6 py-2.5 text-sm font-bold rounded-[14px] transition-all duration-300 ${activeTab === 'create' ? 'bg-white text-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Create Invoice</button>
              <button onClick={() => setActiveTab('settings')} className={`px-6 py-2.5 text-sm font-bold rounded-[14px] transition-all duration-300 ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-lg shadow-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>Admin Settings</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 py-10">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 no-print">
              <InvoiceForm currentInvoice={currentInvoice} setCurrentInvoice={setCurrentInvoice} products={products} />
            </div>
            <div className="lg:col-span-5 relative">
              <div className="sticky top-32">
                <div className="flex justify-between items-center mb-6 no-print">
                   <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Live Preview</h2>
                   <div className="flex gap-2">
                     <button onClick={resetInvoice} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm" title="Reset All">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                     <div className="flex bg-slate-900 p-1 rounded-2xl shadow-2xl">
                        <button onClick={handlePrint} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-all border border-transparent">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          Print / PDF
                        </button>
                        <button onClick={downloadJPG} className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-all border border-transparent">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          JPG
                        </button>
                     </div>
                   </div>
                </div>
                <div ref={previewRef} className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 invoice-card">
                  <InvoicePreview invoice={currentInvoice} settings={settings} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AdminPanel settings={settings} setSettings={handleSettingsUpdate} products={products} setProducts={handleProductsUpdate} />
        )}
      </main>
      <SpeedInsights />
    </div>
  );
};

export default App;
