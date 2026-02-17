import React, { useState } from 'react';
import { InvoiceData, Product, InvoiceItem } from '../types';
import { DISTRICTS, PAYMENT_METHODS } from '../constants';
import { parseInvoiceInput, detectLocationFromAddress, generateThankYouMessage, validateInvoiceAI } from '../services/geminiService';

interface Props {
  currentInvoice: InvoiceData;
  setCurrentInvoice: React.Dispatch<React.SetStateAction<InvoiceData>>;
  products: Product[];
}

const InvoiceForm: React.FC<Props> = ({ currentInvoice, setCurrentInvoice, products }) => {
  const [magicInput, setMagicInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleMagicParse = async () => {
    if (!magicInput.trim()) return;
    setIsParsing(true);
    const parsed = await parseInvoiceInput(magicInput);
    if (parsed) {
      setCurrentInvoice(prev => ({
        ...prev,
        customerName: parsed.customerName || prev.customerName,
        customerPhone: parsed.customerPhone || prev.customerPhone,
        customerAddress: parsed.customerAddress || prev.customerAddress,
        deliveryType: parsed.deliveryType || prev.deliveryType,
        advancePayment: parsed.advancePayment || prev.advancePayment,
        items: parsed.items && parsed.items.length > 0 
          ? parsed.items.map((it: any) => ({
              id: Math.random().toString(),
              name: it.name,
              size: it.size,
              quantity: it.quantity || 1,
              price: it.price || 0
            })) 
          : prev.items
      }));
      
      if (parsed.customerName) {
        const msg = await generateThankYouMessage(parsed.customerName);
        setCurrentInvoice(prev => ({ ...prev, thankYouMessage: msg }));
      }

      if (parsed.customerAddress) {
        handleAddressBlur(parsed.customerAddress);
      }

      const issues = await validateInvoiceAI({ ...currentInvoice, ...parsed });
      setWarnings(issues);
    }
    setIsParsing(false);
  };

  const handleAddressBlur = async (address: string) => {
    if (!address) return;
    const location = await detectLocationFromAddress(address);
    if (location) {
      setCurrentInvoice(prev => ({
        ...prev,
        district: location.district || prev.district,
        deliveryType: (location.deliveryType as any) || prev.deliveryType
      }));
    }
  };

  const updateField = (field: keyof InvoiceData, value: any) => {
    if (field === 'customerPhone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 11) return;
      setCurrentInvoice(prev => ({ ...prev, [field]: cleaned }));
    } else {
      setCurrentInvoice(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    setCurrentInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const onProductNameChange = (index: number, name: string) => {
    const matchedProduct = products.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase());
    
    setCurrentInvoice(prev => {
      const newItems = [...prev.items];
      const currentItem = newItems[index];
      const newItem = { ...currentItem, name };
      
      if (matchedProduct && matchedProduct.sizes.length > 0) {
        // Only reset size and price if it's a new product selection
        if (currentItem.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
          newItem.size = matchedProduct.sizes[0].label;
          newItem.price = matchedProduct.sizes[0].price;
        }
      }
      
      newItems[index] = newItem;
      return { ...prev, items: newItems };
    });
  };

  const onSizeChange = (index: number, sizeLabel: string) => {
    setCurrentInvoice(prev => {
      const newItems = [...prev.items];
      const item = newItems[index];
      const matchedProduct = products.find(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
      
      const newItem = { ...item, size: sizeLabel };
      if (matchedProduct) {
        const sizeObj = matchedProduct.sizes.find(s => s.label === sizeLabel);
        if (sizeObj) {
          newItem.price = sizeObj.price;
        }
      }
      
      newItems[index] = newItem;
      return { ...prev, items: newItems };
    });
  };

  const addItem = () => {
    setCurrentInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(), name: '', size: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (currentInvoice.items.length === 1) return;
    setCurrentInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const isPhoneInvalid = currentInvoice.customerPhone.length > 0 && currentInvoice.customerPhone.length !== 11;

  return (
    <div className="space-y-10">
      {/* Magic AI Box */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-300 overflow-hidden relative group">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-700"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">AI Smart Input</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 text-indigo-300">Intelligent Form Filling</p>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={magicInput}
              onChange={(e) => setMagicInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[140px] text-base"
              placeholder="e.g. Rahim, 017... 1kg Honey, Inside Dhaka, 500 Advance..."
            />
            <button 
              onClick={handleMagicParse} 
              disabled={isParsing || !magicInput} 
              className="absolute bottom-5 right-5 bg-white hover:bg-indigo-500 hover:text-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl disabled:opacity-50"
            >
              {isParsing ? 'Processing...' : 'Magic Fill'}
            </button>
          </div>
        </div>
      </section>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-5 rounded-3xl animate-in slide-in-from-top-4">
          <div className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="text-sm font-bold text-red-700">
              <p className="uppercase tracking-widest text-[10px] mb-1">Attention Required</p>
              <ul className="list-disc list-inside">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
          Customer Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number (11 Digits) *</label>
            <input
              type="text"
              value={currentInvoice.customerPhone}
              onChange={(e) => updateField('customerPhone', e.target.value)}
              className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-4 transition-all outline-none ${isPhoneInvalid ? 'border-red-400 ring-red-50' : 'border-transparent focus:border-slate-900 focus:ring-slate-100'}`}
              placeholder="017XXXXXXXX"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Customer Name</label>
            <input type="text" value={currentInvoice.customerName} onChange={(e) => updateField('customerName', e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold transition-all outline-none" placeholder="Enter name" />
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Delivery Address</label>
            <textarea
              value={currentInvoice.customerAddress}
              onChange={(e) => updateField('customerAddress', e.target.value)}
              onBlur={(e) => handleAddressBlur(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium transition-all outline-none min-h-[120px]"
              placeholder="Street, area, house details..."
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">District</label>
            <div className="relative">
              <select 
                value={currentInvoice.district} 
                onChange={(e) => updateField('district', e.target.value)} 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-black appearance-none transition-all outline-none cursor-pointer"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Delivery Region</label>
            <div className="relative">
              <select 
                value={currentInvoice.deliveryType} 
                onChange={(e) => updateField('deliveryType', e.target.value as any)} 
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-2xl px-6 py-4 text-indigo-700 font-black appearance-none transition-all outline-none cursor-pointer"
              >
                <option value="Inside Dhaka">Inside Dhaka</option>
                <option value="Outside Dhaka">Outside Dhaka</option>
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
            <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
            Item Details
          </h3>
          <button 
            onClick={addItem} 
            className="flex items-center gap-2 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            New Row
          </button>
        </div>
        
        <div className="space-y-6">
          {currentInvoice.items.map((item, index) => {
             const matchedProduct = products.find(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
             
             return (
              <div key={item.id} className="relative group/item animate-in fade-in slide-in-from-right-2">
                <div className="grid grid-cols-12 gap-6 p-8 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-orange-200 transition-all hover:bg-white hover:shadow-xl">
                  <div className="col-span-12 lg:col-span-5 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Product</label>
                    <div className="relative">
                      <input
                        list={`product-list-${index}`}
                        value={item.name}
                        onChange={(e) => onProductNameChange(index, e.target.value)}
                        className="w-full bg-white border-2 border-slate-100 focus:border-orange-500 rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-sm"
                        placeholder="Type product name..."
                      />
                      <datalist id={`product-list-${index}`}>
                        {products.map(p => <option key={p.id} value={p.name} />)}
                      </datalist>
                    </div>
                  </div>
                  
                  <div className="col-span-6 lg:col-span-3 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Size / Option</label>
                    <div className="relative">
                      {matchedProduct && matchedProduct.sizes.length > 0 ? (
                        <>
                          <select
                            value={item.size}
                            onChange={(e) => onSizeChange(index, e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 focus:border-orange-500 rounded-xl px-5 py-3.5 text-sm font-bold appearance-none outline-none transition-all shadow-sm cursor-pointer pr-10"
                          >
                            {matchedProduct.sizes.map(s => (
                              <option key={s.id} value={s.label}>{s.label}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </>
                      ) : (
                        <input 
                          type="text" 
                          value={item.size} 
                          onChange={(e) => updateItem(index, 'size', e.target.value)} 
                          className="w-full bg-white border-2 border-slate-100 focus:border-orange-500 rounded-xl px-5 py-3.5 text-sm font-bold outline-none transition-all shadow-sm" 
                          placeholder="Manual Size"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-3 lg:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Qty</label>
                    <input type="number" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)} className="w-full bg-white border-2 border-slate-100 focus:border-orange-500 rounded-xl px-5 py-3.5 text-sm font-black outline-none transition-all text-center shadow-sm" />
                  </div>
                  
                  <div className="col-span-3 lg:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Price</label>
                    <input type="number" value={item.price} onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)} className="w-full bg-white border-2 border-slate-100 focus:border-orange-500 rounded-xl px-5 py-3.5 text-sm font-black outline-none transition-all text-right shadow-sm text-orange-600" />
                  </div>
                  
                  <button 
                    onClick={() => removeItem(index)} 
                    className="absolute -right-3 -top-3 lg:static lg:col-span-1 flex items-center justify-center bg-white lg:bg-transparent shadow-lg lg:shadow-none w-10 h-10 lg:w-auto lg:h-auto rounded-full text-slate-300 hover:text-red-500 transition-all border border-slate-100 lg:border-none"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
             );
          })}
        </div>
      </div>

      {/* Financials Summary */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          Financials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Discount (৳)</label>
            <input type="number" value={currentInvoice.discountAmount} onChange={(e) => updateField('discountAmount', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border-2 border-transparent focus:border-red-400 focus:ring-4 focus:ring-red-50 rounded-2xl px-6 py-4 text-slate-900 font-black transition-all outline-none" placeholder="0" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Paid Advance (৳)</label>
            <input type="number" value={currentInvoice.advancePayment} onChange={(e) => updateField('advancePayment', parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 rounded-2xl px-6 py-4 text-emerald-700 font-black transition-all outline-none" placeholder="0" />
          </div>
          
          {currentInvoice.advancePayment > 0 && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-emerald-50/50 rounded-[2rem] border-2 border-emerald-100">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">Method *</label>
                <div className="relative">
                  <select 
                    value={currentInvoice.paymentMethod} 
                    onChange={(e) => updateField('paymentMethod', e.target.value)} 
                    className="w-full bg-white border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl px-6 py-4 text-emerald-900 font-black appearance-none outline-none transition-all shadow-sm"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest px-1">TxID *</label>
                <input 
                  type="text" 
                  value={currentInvoice.transactionId} 
                  onChange={(e) => updateField('transactionId', e.target.value)} 
                  className="w-full bg-white border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl px-6 py-4 text-emerald-900 font-black outline-none transition-all shadow-sm" 
                  placeholder="e.g. BK72..." 
                />
              </div>
            </div>
          )}
          
          <div className="md:col-span-2 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Private Note</label>
            <textarea 
              value={currentInvoice.customNote} 
              onChange={(e) => updateField('customNote', e.target.value)} 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 focus:ring-4 focus:ring-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium transition-all outline-none h-28" 
              placeholder="Internal business notes..." 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;