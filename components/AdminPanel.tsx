
import React, { useState } from 'react';
import { BusinessSettings, Product, ProductSize } from '../types';

interface Props {
  settings: BusinessSettings;
  setSettings: (settings: BusinessSettings) => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const AdminPanel: React.FC<Props> = ({ settings, setSettings, products, setProducts }) => {
  const [newProductName, setNewProductName] = useState('');
  const [tempSizes, setTempSizes] = useState<ProductSize[]>([]);
  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizePrice, setNewSizePrice] = useState(0);

  const addSizeToTemp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newSizeLabel || newSizePrice <= 0) return;
    setTempSizes([...tempSizes, { id: Math.random().toString(), label: newSizeLabel, price: newSizePrice }]);
    setNewSizeLabel('');
    setNewSizePrice(0);
  };

  const removeSizeFromTemp = (id: string) => {
    setTempSizes(tempSizes.filter(s => s.id !== id));
  };

  const saveProduct = () => {
    if (!newProductName || tempSizes.length === 0) return;
    const product: Product = {
      id: Math.random().toString(),
      name: newProductName,
      sizes: tempSizes
    };
    setProducts([...products, product]);
    setNewProductName('');
    setTempSizes([]);
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addSettingSize = (size: string) => {
    if (!size || settings.availableSizes.includes(size)) return;
    setSettings({ ...settings, availableSizes: [...settings.availableSizes, size] });
  };

  const removeSettingSize = (size: string) => {
    setSettings({ ...settings, availableSizes: settings.availableSizes.filter(s => s !== size) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-12">
        {/* Business Setup */}
        <section className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
            Business Identity
          </h3>

          <div className="space-y-8">
            <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-slate-900 transition-all cursor-pointer group relative">
               <div className="relative">
                  {settings.logo ? (
                    <img src={settings.logo} className="w-24 h-24 rounded-3xl object-contain bg-white shadow-lg border border-slate-100" alt="Logo" />
                  ) : (
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-slate-300 font-black border border-slate-100 uppercase text-[10px]">No Logo</div>
                  )}
                  <input type="file" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSettings({ ...settings, logo: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" id="logo-upload" accept="image/*" />
                  <label htmlFor="logo-upload" className="absolute -bottom-3 -right-3 bg-slate-900 p-2.5 rounded-2xl text-white cursor-pointer hover:scale-110 transition-transform shadow-2xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  </label>
               </div>
               <div>
                 <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Brand Mark</p>
                 <p className="text-xs text-slate-500 font-bold mt-1">Upload transparent PNG preferred</p>
               </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Business Name</label>
              <input type="text" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contact Number</label>
                <input type="text" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Invoice Prefix</label>
                <input type="text" value={settings.invoicePrefix} onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official Address</label>
              <textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none transition-all h-32" />
            </div>
          </div>
        </section>

        {/* Dynamic Global Sizes */}
        <section className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
             <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
             Global Unit List
          </h3>
          <div className="flex flex-wrap gap-3 mb-10">
             {settings.availableSizes.map(s => (
               <span key={s} className="bg-slate-50 text-slate-900 border border-slate-100 px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-3 group transition-all hover:bg-slate-900 hover:text-white">
                 {s}
                 <button onClick={() => removeSettingSize(s)} className="text-slate-300 group-hover:text-white transition-colors">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" /></svg>
                 </button>
               </span>
             ))}
          </div>
          <div className="flex gap-4">
             <input type="text" id="new-size-config" placeholder="New size e.g. 10kg" className="flex-grow bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl px-6 py-4 text-sm font-black outline-none transition-all" />
             <button 
              onClick={() => {
                const el = document.getElementById('new-size-config') as HTMLInputElement;
                addSettingSize(el.value);
                el.value = '';
              }}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-black transition-all hover:bg-indigo-600 shadow-xl"
             >
               Add Unit
             </button>
          </div>
        </section>
      </div>

      <div className="space-y-12">
        {/* Advanced Product Creation */}
        <section className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
             <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
             New Product Catalog
          </h3>
          <div className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Master Product Name</label>
              <input type="text" placeholder="e.g. Pure Ghee" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-6 py-5 font-black text-xl outline-none transition-all" />
            </div>
            
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-8">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration & Pricing</p>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Select Unit</label>
                    <div className="relative">
                      <select value={newSizeLabel} onChange={(e) => setNewSizeLabel(e.target.value)} className="w-full bg-white border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 text-sm font-black outline-none appearance-none transition-all cursor-pointer shadow-sm">
                        <option value="">Choose Unit</option>
                        {settings.availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Unit Price (৳)</label>
                    <input type="number" placeholder="0.00" value={newSizePrice || ''} onChange={(e) => setNewSizePrice(parseInt(e.target.value) || 0)} className="w-full bg-white border-2 border-transparent focus:border-orange-500 rounded-2xl px-5 py-4 text-sm font-black outline-none transition-all shadow-sm" />
                  </div>
               </div>
               <button 
                type="button"
                onClick={addSizeToTemp} 
                className="w-full bg-white border-2 border-slate-100 hover:border-orange-500 hover:text-orange-600 text-slate-900 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-sm"
               >
                 + Add variant to product
               </button>
               
               <div className="space-y-3 mt-6">
                  {tempSizes.map(s => (
                    <div key={s.id} className="flex justify-between items-center bg-white p-5 rounded-2xl text-sm border border-slate-100 shadow-sm animate-in zoom-in-95">
                       <span className="font-black text-slate-900 uppercase tracking-tight">{s.label}</span>
                       <span className="text-orange-600 font-black">৳{s.price.toLocaleString()}</span>
                       <button onClick={() => removeSizeFromTemp(s.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  ))}
               </div>
            </div>
            
            <button 
              onClick={saveProduct} 
              disabled={!newProductName || tempSizes.length === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-20 text-white font-black py-6 rounded-[2rem] text-lg transition-all shadow-2xl uppercase tracking-widest"
            >
              Save Product
            </button>
          </div>
        </section>

        {/* Catalog List */}
        <section className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-slate-900 rounded-full"></span>
              Inventory
           </h3>
           <div className="space-y-6">
              {products.map(p => (
                <div key={p.id} className="group border-2 border-slate-50 p-8 rounded-[2.5rem] hover:border-slate-200 hover:bg-slate-50 transition-all">
                   <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <p className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{p.name}</p>
                        <div className="flex flex-wrap gap-2">
                           {p.sizes.map(s => <span key={s.id} className="text-[10px] bg-white border border-slate-100 text-slate-900 px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-sm">{s.label}: <span className="text-emerald-600">৳{s.price}</span></span>)}
                        </div>
                      </div>
                      <button onClick={() => removeProduct(p.id)} className="text-slate-200 group-hover:text-red-500 transition-colors p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-24 text-slate-200 font-black uppercase tracking-widest text-xs">Catalog is empty</div>
              )}
           </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPanel;
