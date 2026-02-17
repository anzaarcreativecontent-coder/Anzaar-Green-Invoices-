
import React from 'react';
import { InvoiceData, BusinessSettings } from '../types';

interface Props {
  invoice: InvoiceData;
  settings: BusinessSettings;
}

const InvoicePreview: React.FC<Props> = ({ invoice, settings }) => {
  return (
    <div className="p-20 bg-white min-h-[1120px] flex flex-col text-slate-950 antialiased selection:bg-slate-100">
      
      {/* 1. BRANDING & IDENTITY */}
      <div className="flex justify-between items-start mb-32">
        <div className="space-y-8">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="h-16 w-auto object-contain grayscale brightness-50" />
          ) : (
            <div className="h-12 w-12 bg-slate-950 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {settings.name.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tighter uppercase">{settings.name}</h2>
            <p className="text-[10px] font-medium text-slate-400 max-w-[200px] leading-relaxed uppercase tracking-widest">
              {settings.address}
            </p>
            <p className="text-[11px] font-bold text-slate-900 tracking-tight">{settings.phone}</p>
          </div>
        </div>

        {/* INVOICE META */}
        <div className="text-right space-y-8">
          <div className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] select-none">
            Digital Receipt
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Number</span>
            <span className="text-[11px] font-bold text-slate-900">#{invoice.invoiceNumber}</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Issued</span>
            <span className="text-[11px] font-bold text-slate-900">{invoice.date}</span>
          </div>
        </div>
      </div>

      {/* 2. RECIPIENT & STATUS */}
      <div className="grid grid-cols-12 gap-4 mb-32">
        <div className="col-span-8">
          <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Invoiced To</h4>
          <div className="space-y-2">
            <p className="text-3xl font-black text-slate-900 tracking-tighter">
              {invoice.customerName || 'Private Client'}
            </p>
            <p className="text-sm font-bold text-slate-500 tracking-tight">{invoice.customerPhone || 'Not provided'}</p>
            <div className="text-[13px] text-slate-400 font-medium leading-relaxed pt-2 max-w-[320px]">
              {invoice.customerAddress || 'Local pickup order'}
              <p className="text-slate-950 font-black mt-1 uppercase tracking-[0.2em] text-[10px]">
                {invoice.district}
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-span-4 flex flex-col justify-end items-end">
          <div className="text-right space-y-3">
             <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${invoice.due > 0 ? 'border-slate-200 text-slate-400' : 'border-emerald-200 text-emerald-600 bg-emerald-50/20'}`}>
                {invoice.due > 0 ? 'Payment Outstanding' : 'Account Settled'}
             </div>
             <div className="pt-2">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Total Payable</span>
               <span className="text-5xl font-black text-slate-900 tracking-tighter">
                 ৳{invoice.due.toLocaleString()}
               </span>
             </div>
          </div>
        </div>
      </div>

      {/* 3. ITEMS TABLE: SUPER MINIMAL */}
      <div className="flex-grow">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-slate-950">
              <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-left">Description</th>
              <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">Qty</th>
              <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Unit Price</th>
              <th className="pb-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="py-10 pr-6">
                  <p className="text-base font-bold text-slate-900 tracking-tight">{item.name || 'Custom Product'}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{item.size}</p>
                </td>
                <td className="py-10 text-sm font-bold text-slate-500 text-center">{item.quantity}</td>
                <td className="py-10 text-sm font-bold text-slate-500 text-right">৳{item.price.toLocaleString()}</td>
                <td className="py-10 text-base font-black text-slate-900 text-right">৳{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. SETTLEMENT SUMMARY */}
      <div className="mt-20">
        <div className="flex justify-between items-start">
          <div className="max-w-[400px] space-y-12">
            {invoice.customNote && (
              <div className="space-y-3">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Notes</p>
                 <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic pr-12">
                   "{invoice.customNote}"
                 </p>
              </div>
            )}
            
            {invoice.advancePayment > 0 && (
               <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Payment Recorded</p>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-black text-slate-900 bg-slate-50 px-4 py-2 rounded uppercase tracking-widest border border-slate-100">
                      {invoice.paymentMethod}
                    </span>
                    {invoice.transactionId && (
                      <span className="text-[10px] font-mono text-slate-400 select-all">
                        Ref: {invoice.transactionId}
                      </span>
                    )}
                  </div>
               </div>
            )}
          </div>
          
          <div className="w-[300px] space-y-4">
            <div className="flex justify-between items-center text-[12px] font-bold text-slate-400">
               <span className="uppercase tracking-widest">Gross Subtotal</span>
               <span className="text-slate-900">৳{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[12px] font-bold text-slate-400">
               <span className="uppercase tracking-widest">Shipping & Handling</span>
               <span className="text-slate-900">৳{invoice.deliveryCharge.toLocaleString()}</span>
            </div>
            
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between items-center text-[12px] font-bold text-slate-900">
                 <span className="uppercase tracking-widest">Adjustments</span>
                 <span className="text-rose-600">- ৳{invoice.discountAmount.toLocaleString()}</span>
              </div>
            )}

            {invoice.advancePayment > 0 && (
              <div className="flex justify-between items-center text-[12px] font-bold text-slate-900">
                 <span className="uppercase tracking-widest">Advance Credit</span>
                 <span className="text-emerald-600">- ৳{invoice.advancePayment.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-8 mt-4 border-t-2 border-slate-950 flex justify-between items-baseline">
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em]">Net Balance</span>
               <span className="text-3xl font-black text-slate-900 tracking-tighter">৳{invoice.due.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 5. BRAND FOOTER: ULTRA SUBTLE */}
        <div className="mt-32 pt-12 border-t border-slate-50 text-center">
           <p className="text-[9px] font-medium text-slate-200 tracking-widest uppercase mb-4">
             Thank you for your business
           </p>
           <p className="text-[10px] font-normal text-slate-300 tracking-[0.02em]">
              {settings.footerMessage}
           </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
