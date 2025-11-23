
import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, Save, Loader2, RefreshCw, Zap, Lightbulb, Bot
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, Tooltip 
} from 'recharts';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebaseService.ts';
import { callGemini } from '../../services/geminiService.ts';
import { fmtCurrency, getDateKey } from '../../constants.ts';
import { PageHeader } from '../LayoutComponents.tsx';
import { ProductSale } from '../../types.ts';

export const ProductAnalysisView = ({ appData, setAppData, selectedCompanyId, selectedDate, setSelectedDate, PageHeaderProps, user }: any) => {
    const [salesData, setSalesData] = useState<ProductSale[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Get current month's key
    const currentKey = getDateKey(selectedDate.year, selectedDate.month);

    useEffect(() => {
        if(selectedCompanyId && appData.db[selectedCompanyId] && appData.db[selectedCompanyId][currentKey]) {
            const monthlyData = appData.db[selectedCompanyId][currentKey];
            if(monthlyData.product_sales) {
                setSalesData(monthlyData.product_sales);
            } else {
                setSalesData([]);
            }
        } else {
            setSalesData([]);
        }
    }, [selectedCompanyId, selectedDate, appData]);

    const handleAddProduct = () => {
        const newProd: ProductSale = {
            id: Date.now().toString(),
            name: "Yeni Ürün",
            qty: 0,
            price: 0,
            cost: 0
        };
        setSalesData([...salesData, newProd]);
    };

    const handleUpdate = (id: string, field: keyof ProductSale, val: any) => {
        setSalesData(salesData.map(p => p.id === id ? { ...p, [field]: val } : p));
    };

    const handleDelete = (id: string) => {
        setSalesData(salesData.filter(p => p.id !== id));
    };

    const saveChanges = async () => {
        setIsSaving(true);
        const newDb = { ...appData.db };
        if (!newDb[selectedCompanyId]) newDb[selectedCompanyId] = {};
        
        const existingData = newDb[selectedCompanyId][currentKey] || {};
        
        newDb[selectedCompanyId][currentKey] = { 
            ...existingData,
            product_sales: salesData,
        };

        setAppData((prev: any) => ({ ...prev, db: newDb }));

        if (user && db) {
            try {
                const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'core');
                await setDoc(docRef, { db: newDb }, { merge: true });
            } catch (e) {
                console.error(e);
            }
        }
        setIsSaving(false);
    };

    const syncToDashboard = async () => {
        if(!window.confirm("Bu işlem, ana ekrandaki 'Toplam Ciro' ve 'Satılan Adet' verilerini buradaki ürün toplamlarıyla ezecektir. Onaylıyor musunuz?")) return;
        
        const totalRev = salesData.reduce((acc, p) => acc + (p.qty * p.price), 0);
        const totalSales = salesData.reduce((acc, p) => acc + p.qty, 0);
        
        const newDb = { ...appData.db };
        const existingData = newDb[selectedCompanyId][currentKey] || {};
        
        newDb[selectedCompanyId][currentKey] = {
            ...existingData,
            "SAL - Toplam Tutar Ciro": parseFloat(totalRev.toFixed(2)),
            "SAL - Toplam Satılan Ürün Adet": totalSales
        };
        
        setAppData((prev: any) => ({ ...prev, db: newDb }));
        
        if (user && db) {
            const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'core');
            await setDoc(docRef, { db: newDb }, { merge: true });
            alert("Ana panel verileri güncellendi!");
        }
    };

    const runAiAnalysis = async () => {
        setIsAiLoading(true);
        const history = [];
        for(let i=0; i<12; i++) {
            let d = new Date(selectedDate.year, selectedDate.month - 1);
            d.setMonth(d.getMonth() - i);
            const k = getDateKey(d.getFullYear(), d.getMonth() + 1);
            const mData = appData.db[selectedCompanyId]?.[k]?.product_sales;
            if(mData) {
                history.push({ date: k, products: mData });
            }
        }

        const prompt = `
            Aşağıdaki JSON verisi bir e-ticaret/perakende firmasının son aylardaki ürün bazlı satış performansıdır.
            Veri: ${JSON.stringify(history)}
            
            Lütfen şu başlıklar altında Türkçe kısa ve çarpıcı bir analiz yap:
            1. En Yıldız Ürün (Hem hacim hem kar getiren)
            2. Gizli Kahraman (Yüksek kar marjı ama düşük hacim)
            3. Stok Riski (Düşüş trendinde olan)
            4. Gelecek Ay İçin Öngörü ve Tavsiye
        `;

        try {
            const res = await callGemini(prompt);
            setAiAnalysis(res);
        } catch(e) {
            setAiAnalysis("AI bağlantısında hata oluştu.");
        }
        setIsAiLoading(false);
    };

    // --- CALCULATIONS FOR UI ---
    const totalRevenue = salesData.reduce((acc, p) => acc + (p.qty * p.price), 0);
    const totalProfit = salesData.reduce((acc, p) => acc + (p.qty * (p.price - p.cost)), 0);
    const totalMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const sortedByRev = [...salesData].sort((a,b) => (b.qty * b.price) - (a.qty * a.price));
    const topProduct = sortedByRev[0];
    
    const sortedByMargin = [...salesData].filter(p => p.price > 0).sort((a,b) => ((b.price - b.cost)/b.price) - ((a.price - a.cost)/a.price));
    const highestMarginProduct = sortedByMargin[0];

    // Chart Data Preparation
    const chartData = salesData.map(p => ({
        name: p.name,
        ciro: p.qty * p.price,
        kar: p.qty * (p.price - p.cost)
    }));

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader {...PageHeaderProps} title="Ürün Analizi" sub="Stok, Karlılık ve Ürün Bazlı Performans" />

            {/* TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Toplam Ürün Cirosu</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{fmtCurrency(totalRevenue)}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Toplam Brüt Kar</div>
                    <div className="text-2xl font-bold text-blue-400 mt-1">{fmtCurrency(totalProfit)}</div>
                </div>
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ort. Kar Marjı</div>
                    <div className="text-2xl font-bold text-purple-400 mt-1">%{totalMargin.toFixed(1)}</div>
                </div>
                 <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Çeşit / Kalem</div>
                    <div className="text-2xl font-bold text-white mt-1">{salesData.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Product List & Editing */}
                <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
                     <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                         <h3 className="font-bold text-white flex items-center gap-2"><Package size={20} className="text-indigo-500"/> Ürün Listesi</h3>
                         <div className="flex gap-2">
                             <button onClick={handleAddProduct} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
                                 <Plus size={16}/> Yeni Ekle
                             </button>
                             <button onClick={saveChanges} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1">
                                 {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Kaydet
                             </button>
                         </div>
                     </div>
                     <div className="flex-1 overflow-auto p-4">
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="text-xs text-slate-400 uppercase border-b border-slate-700">
                                     <th className="p-2">Ürün Adı</th>
                                     <th className="p-2 text-center">Adet</th>
                                     <th className="p-2 text-center">Satış (TL)</th>
                                     <th className="p-2 text-center">Maliyet (TL)</th>
                                     <th className="p-2 text-center">Kar (TL)</th>
                                     <th className="p-2"></th>
                                 </tr>
                             </thead>
                             <tbody className="text-sm">
                                 {salesData.map((p) => (
                                     <tr key={p.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-700/30 group transition-colors">
                                         <td className="p-2">
                                             <input 
                                                className="bg-transparent text-white outline-none w-full placeholder:text-slate-600" 
                                                value={p.name} 
                                                onChange={(e) => handleUpdate(p.id, 'name', e.target.value)}
                                                placeholder="Ürün Adı"
                                             />
                                         </td>
                                         <td className="p-2">
                                              <input 
                                                type="number"
                                                className="bg-slate-900/50 text-center text-white outline-none w-20 p-1 rounded border border-slate-700 focus:border-indigo-500 mx-auto block" 
                                                value={p.qty} 
                                                onChange={(e) => handleUpdate(p.id, 'qty', parseFloat(e.target.value) || 0)}
                                             />
                                         </td>
                                         <td className="p-2">
                                              <input 
                                                type="number"
                                                className="bg-slate-900/50 text-center text-white outline-none w-24 p-1 rounded border border-slate-700 focus:border-indigo-500 mx-auto block" 
                                                value={p.price} 
                                                onChange={(e) => handleUpdate(p.id, 'price', parseFloat(e.target.value) || 0)}
                                             />
                                         </td>
                                         <td className="p-2">
                                              <input 
                                                type="number"
                                                className="bg-slate-900/50 text-center text-slate-300 outline-none w-24 p-1 rounded border border-slate-700 focus:border-indigo-500 mx-auto block" 
                                                value={p.cost} 
                                                onChange={(e) => handleUpdate(p.id, 'cost', parseFloat(e.target.value) || 0)}
                                             />
                                         </td>
                                         <td className="p-2 text-center font-bold text-emerald-400">
                                             {fmtCurrency((p.price - p.cost) * p.qty)}
                                         </td>
                                         <td className="p-2 text-right">
                                             <button onClick={() => handleDelete(p.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                                                 <Trash2 size={16}/>
                                             </button>
                                         </td>
                                     </tr>
                                 ))}
                                 {salesData.length === 0 && (
                                     <tr>
                                         <td colSpan={6} className="p-8 text-center text-slate-500">
                                             Henüz ürün girişi yapılmamış.
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                     <div className="p-4 bg-slate-900/50 border-t border-slate-700 text-right">
                         <button onClick={syncToDashboard} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2 ml-auto">
                             <RefreshCw size={12}/> Toplamları Ana Panele Aktar (Senkronize Et)
                         </button>
                     </div>
                </div>

                {/* Right: Insights & AI */}
                <div className="space-y-6">
                     {/* Highlights */}
                     <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
                         <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Lightbulb size={18} className="text-yellow-400"/> Öne Çıkanlar</h3>
                         
                         {topProduct && (
                             <div className="mb-4 pb-4 border-b border-slate-700">
                                 <div className="text-xs text-slate-500 uppercase font-bold">Ciro Şampiyonu</div>
                                 <div className="text-lg font-bold text-white">{topProduct.name}</div>
                                 <div className="text-sm text-emerald-400">{fmtCurrency(topProduct.qty * topProduct.price)}</div>
                             </div>
                         )}
                         
                         {highestMarginProduct && (
                             <div>
                                 <div className="text-xs text-slate-500 uppercase font-bold">Karlılık Lideri</div>
                                 <div className="text-lg font-bold text-white">{highestMarginProduct.name}</div>
                                 <div className="text-sm text-blue-400">% {(((highestMarginProduct.price - highestMarginProduct.cost) / highestMarginProduct.price) * 100).toFixed(1)} Marj</div>
                             </div>
                         )}
                     </div>

                     {/* AI Analysis */}
                     <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-2xl border border-indigo-500/30 p-6 relative overflow-hidden">
                         <div className="flex justify-between items-start mb-4 relative z-10">
                             <h3 className="font-bold text-indigo-300 flex items-center gap-2"><Bot size={18}/> AI Stok Danışmanı</h3>
                             <button onClick={runAiAnalysis} disabled={isAiLoading} className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-lg text-indigo-300 transition-colors">
                                 {isAiLoading ? <Loader2 className="animate-spin" size={16}/> : <Zap size={16}/>}
                             </button>
                         </div>
                         
                         {aiAnalysis ? (
                             <div className="text-xs text-slate-300 space-y-2 leading-relaxed relative z-10 whitespace-pre-line">
                                 {aiAnalysis}
                             </div>
                         ) : (
                             <div className="text-xs text-slate-500 text-center py-8">
                                 Detaylı stok ve satış analizi için butona tıklayın.
                             </div>
                         )}
                     </div>
                     
                     <div className="h-48 bg-slate-800 rounded-2xl border border-slate-700 p-4">
                         <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={chartData}>
                                 <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} formatter={(val:any) => fmtCurrency(val)} />
                                 <Bar dataKey="ciro" fill="#3b82f6" radius={[4,4,0,0]} />
                                 <Bar dataKey="kar" fill="#10b981" radius={[4,4,0,0]} />
                             </BarChart>
                         </ResponsiveContainer>
                     </div>
                </div>
            </div>
        </div>
    );
};
