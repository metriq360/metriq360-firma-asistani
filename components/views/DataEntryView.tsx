
import React, { useState, useEffect, useMemo } from 'react';
import { Target, Save, Loader2, Lock, Sliders } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebaseService.ts';
import { CALCULATED_FIELDS, fmtNum } from '../../constants.ts';
import { DataEntryPeriodSelector } from '../LayoutComponents.tsx';

// --- Helper Functions (Defined outside component to prevent re-creation) ---

const calculateDerivedValues = (data: any) => {
    if (!data) return {};
    const newCalculations = { ...data };
    const round2 = (val: number) => parseFloat((val || 0).toFixed(2));

    // --- 1. ADS CALCULATIONS ---
    const g_spend = round2(newCalculations["ADS - Google Toplam Reklam Harcaması"]);
    const g_click = round2(newCalculations["ADS - Google Reklam Tıklama Sayısı"]);
    const g_conv = round2(newCalculations["ADS - Google Dönüşüm Sayısı"]);
    const g_rev = round2(newCalculations["ADS - Google Dönüşüm Değeri (Ciro)"]);

    if(g_click > 0) newCalculations["ADS - Google Tıklama Başına Maliyet (CPC)"] = round2(g_spend / g_click);
    if(g_click > 0) newCalculations["ADS - Google Dönüşüm Oranı"] = round2((g_conv / g_click) * 100);
    if(g_spend > 0) newCalculations["ADS - Google Reklam Harcama Getirisi (ROAS)"] = round2(g_rev / g_spend);

    const m_spend = round2(newCalculations["ADS - Meta Toplam Reklam Harcaması"]);
    const m_click = round2(newCalculations["ADS - Meta Reklam Tıklama Sayısı"]);
    const m_conv = round2(newCalculations["ADS - Meta Dönüşüm Sayısı"]);
    const m_rev = round2(newCalculations["ADS - Meta Dönüşüm Değeri (Ciro)"]);

    if(m_click > 0) newCalculations["ADS - Meta Tıklama Başına Maliyet (CPC)"] = round2(m_spend / m_click);
    if(m_click > 0) newCalculations["ADS - Meta Dönüşüm Oranı"] = round2((m_conv / m_click) * 100);
    if(m_spend > 0) newCalculations["ADS - Meta Reklam Harcama Getirisi (ROAS)"] = round2(m_rev / m_spend);

    const t_spend = round2(g_spend + m_spend);
    const t_click = round2(g_click + m_click);
    const t_conv = round2(g_conv + m_conv);
    const t_rev = round2(g_rev + m_rev);
    const t_view = round2(newCalculations["ADS - Google Gösterim Sayısı"]) + round2(newCalculations["ADS - Meta Gösterim Sayısı"]);

    newCalculations["ADS - TOP Toplam Reklam Harcaması"] = t_spend;
    newCalculations["ADS - TOP Gösterim Sayısı"] = t_view;
    newCalculations["ADS - TOP Reklam Tıklama Sayısı"] = t_click;
    newCalculations["ADS - TOP Dönüşüm Sayısı"] = t_conv;
    if(t_click > 0) newCalculations["ADS - TOP Tıklama Başına Maliyet (CPC)"] = round2(t_spend / t_click);
    if(t_click > 0) newCalculations["ADS - TOP Dönüşüm Oranı"] = round2((t_conv / t_click) * 100);
    if(t_spend > 0) newCalculations["ADS - TOP Reklam Harcama Getirisi (ROAS)"] = round2(t_rev / t_spend);

    // --- 2. SALES CALCULATIONS ---
    const s_ciro = round2(newCalculations["SAL - Toplam Tutar Ciro"]);
    const s_adet = round2(newCalculations["SAL - Toplam Satılan Ürün Adet"]);
    const s_cust = round2(newCalculations["SAL - Toplam Müşteri Sayısı"]);

    if(s_adet > 0) newCalculations["SAL - Ortalama Satış Tutarı"] = round2(s_ciro / s_adet);
    if(s_cust > 0) newCalculations["SAL - Ortalama Sepet-Müşteri Değeri Tutarı"] = round2(s_ciro / s_cust);

    // --- 3. WEB FUNNEL AUTOMATION (SIMPLIFIED FOR MANUAL ENTRY) ---
    newCalculations["WEB-Reklam Trafik Harcama Bütçesi"] = t_spend;
    newCalculations["WEB-Reklamın Trafik Dönüşüm Sayısı"] = t_click; 
    newCalculations["WEB-Reklam Gösterim Sayısı"] = t_view;

    // Retrieve MANUAL values for stages
    const stage1 = round2(newCalculations["WEB-1.AŞAMAYA GEÇENLER"]);
    const stage2 = round2(newCalculations["WEB-2.AŞAMAYA GEÇENLER"]);
    const stage3 = round2(newCalculations["WEB-3.AŞAMAYA GEÇENLER"]);
    const stage4 = round2(newCalculations["WEB-4.AŞAMAYA GEÇENLER"]);
    
    // Auto-fill Satış İşlemi based on Stage 4
    newCalculations["WEB-Satış İşlemi"] = stage4;

    // AUTOMATICALLY CALCULATE DROP-OFFS (MANUAL STAGE ENTRY SUPPORT)
    // Ayrılanlar = (Bu Aşama) - (Sonraki Aşama)
    if (stage1 >= stage2) newCalculations["WEB-1.AŞAMADA AYRILANLAR"] = stage1 - stage2;
    else newCalculations["WEB-1.AŞAMADA AYRILANLAR"] = 0; // Hata önleyici

    if (stage2 >= stage3) newCalculations["WEB-2.AŞAMADA AYRILANLAR"] = stage2 - stage3;
    else newCalculations["WEB-2.AŞAMADA AYRILANLAR"] = 0;

    if (stage3 >= stage4) newCalculations["WEB-3.AŞAMADA AYRILANLAR"] = stage3 - stage4;
    else newCalculations["WEB-3.AŞAMADA AYRILANLAR"] = 0;

    // AUTOMATICALLY CALCULATE RATIOS
    if(stage1 > 0) newCalculations["WEB-Alaka Dönüşüm Oranı (%)"] = round2((stage2 / stage1) * 100);
    if(stage2 > 0 && stage3 > 0) newCalculations["WEB-Değer Dönüşüm Oranı (%)"] = round2((stage3 / stage2) * 100);
    if(stage1 > 0) newCalculations["WEB-Satış Dönüşüm Oranı (%)"] = round2((stage4 / stage1) * 100);
    
    if (stage3 > 0) {
        // Sepet Terk Oranı = (Sepet - Satış) / Sepet
        newCalculations["WEB-Sepet Terk Oranı (%)"] = round2(((stage3 - stage4) / stage3) * 100);
    }

    return newCalculations;
};

export const DataEntryView = ({ KPI_STRUCTURE, getCurrentData, getPrevMonthData, selectedDate, setSelectedDate, selectedCompanyId, appData, setAppData, getDateKey, user }: any) => {
    const [activeCat, setActiveCat] = useState("");
    const [formData, setFormData] = useState<any>({}); 
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Unique key to identify when the context changes (Company or Date)
    const contextKey = `${selectedCompanyId}-${selectedDate.year}-${selectedDate.month}`;

    useEffect(() => { 
        const rawData = getCurrentData();
        setFormData(calculateDerivedValues(rawData));
    }, [contextKey]); 

    const currentCompany = appData.companies.find((c: any) => c.id === selectedCompanyId);

    const isCategoryEnabled = (mainCat: string, subCat: string) => {
        if (!currentCompany || !currentCompany.kpiConfig) return true; 
        const config = currentCompany.kpiConfig;
        if (config[subCat] !== undefined && config[subCat] === false) return false;
        if (mainCat === "SEO ANALİZİ" && config["SEO"] === false) return false;
        if (mainCat === "WEB SİTE-HUNİ ANALİZİ" && config["Web Analiz"] === false) return false;
        return true;
    };

    const visibleCategories = useMemo(() => {
        if(!KPI_STRUCTURE) return [];
        return Object.keys(KPI_STRUCTURE).filter(cat => {
             return Object.keys(KPI_STRUCTURE[cat]).some(subCat => isCategoryEnabled(cat, subCat));
        });
    }, [KPI_STRUCTURE, currentCompany]);

    useEffect(() => {
        if (visibleCategories.length > 0 && !visibleCategories.includes(activeCat)) {
            setActiveCat(visibleCategories[0]);
        }
    }, [visibleCategories]);

    const handleSave = async () => {
      setIsSaving(true);
      try {
          const finalData = { ...formData };
          const key = getDateKey(selectedDate.year, selectedDate.month);
          
          const newDb = { ...appData.db };
          if (!newDb[selectedCompanyId]) newDb[selectedCompanyId] = {};
          newDb[selectedCompanyId][key] = { ...newDb[selectedCompanyId][key], ...finalData };
          
          setAppData((prev: any) => ({ ...prev, db: newDb }));

          if (user && db) {
            const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'core');
            await setDoc(docRef, { db: newDb }, { merge: true });
          }
      } catch (e: any) {
          console.error(e);
          alert("Kaydetme hatası: " + e.message);
      } finally {
          setTimeout(() => setIsSaving(false), 500);
      }
    };

    const handleInputChange = (field: string, value: string) => {
       let newVal = parseFloat(value);
       if (isNaN(newVal)) newVal = 0;

       setFormData((prev: any) => {
           const updated = { ...prev, [field]: newVal };
           return calculateDerivedValues(updated);
       });
    };

    if (!KPI_STRUCTURE || visibleCategories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-500"><Sliders size={32}/></div>
                <h3 className="text-xl font-bold text-white">Veri Girişi Kısıtlı veya Yapılandırılmamış</h3>
                <p className="text-slate-400">Lütfen firma ayarlarından KPI seçimlerini kontrol edin.</p>
            </div>
        )
    }

    return (
      <div className="space-y-6 animate-fade-in pb-20 max-w-2xl mx-auto">
          <DataEntryPeriodSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
              {/* Large Tabs Area */}
              <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/50 scrollbar-thin scrollbar-thumb-slate-800">
                  {visibleCategories.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setActiveCat(cat)} 
                        className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all relative min-w-fit flex-1 text-center ${activeCat === cat ? 'text-indigo-400 bg-slate-900' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
                      >
                        {cat}
                        {activeCat === cat && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                      </button>
                  ))}
              </div>

              <div className="p-0 bg-slate-900">
                  {/* Header Bar */}
                  <div className="flex justify-between items-center px-6 py-4 bg-slate-900/95 border-b border-slate-800 sticky top-0 z-20 backdrop-blur-sm">
                      <h2 className="text-base font-bold text-white flex items-center gap-3">{activeCat}</h2>
                      <button onClick={handleSave} disabled={isSaving} className={`bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 ${isSaving ? 'cursor-wait' : ''}`}>
                          {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                          {isSaving ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                  </div>

                  <div className="pb-8">
                      {KPI_STRUCTURE[activeCat] && Object.entries(KPI_STRUCTURE[activeCat]).map(([subCat, metrics]: any) => {
                          if (!isCategoryEnabled(activeCat, subCat)) return null;

                          return (
                          <div key={subCat} className="animate-fade-in mb-2">
                              {/* Subcategory Header */}
                              <div className="px-6 py-4 bg-slate-950 border-y border-slate-800 mt-4 first:mt-0 flex items-center gap-3">
                                <Target size={20} className="text-indigo-500"/>
                                <h4 className="text-xl text-indigo-300 font-bold uppercase tracking-wider">
                                    {subCat}
                                </h4>
                              </div>
                              
                              <div className="flex flex-col pt-1">
                                  {metrics.map((met: string) => {
                                      const isAuto = CALCULATED_FIELDS.includes(met);
                                      const label = met.split('- ').pop();
                                      const isFocused = focusedField === met;
                                      const val = (formData as any)[met];
                                      
                                      return (
                                          <div 
                                            key={met} 
                                            className={`relative flex items-center justify-between py-4 px-6 transition-all duration-200 group border-b border-slate-800/30 last:border-0 min-h-[60px] ${
                                                isFocused 
                                                ? 'bg-indigo-900/10 z-10' 
                                                : 'hover:bg-slate-800/40'
                                            }`}
                                          >
                                              {isFocused && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]"></div>}

                                              {/* Label */}
                                              <label 
                                                  className={`text-base font-semibold truncate max-w-[65%] transition-colors cursor-pointer ${isFocused ? 'text-indigo-300' : (isAuto ? 'text-slate-500' : 'text-slate-300 group-hover:text-white')}`} 
                                                  title={met}
                                                  onClick={() => document.getElementById(`input-${met}`)?.focus()}
                                              >
                                                  {label}
                                              </label>
                                              
                                              {/* Separator Line */}
                                              <div className={`flex-1 border-b border-dotted mx-3 h-1 mb-1 transition-colors opacity-25 ${isFocused ? 'border-indigo-500' : 'border-slate-600 group-hover:border-slate-500'}`}></div>
                                              
                                              {isAuto ? (
                                                  <div className="w-32 flex items-center justify-end gap-2 text-slate-500 select-none bg-slate-950/50 rounded px-3 py-2 border border-slate-800">
                                                      <Lock size={12} className="opacity-40"/>
                                                      <span className="text-base font-mono font-bold text-yellow-500/60">
                                                          {val !== undefined ? fmtNum(val) : "-"}
                                                      </span>
                                                  </div>
                                              ) : (
                                                  <input 
                                                    id={`input-${met}`}
                                                    type="number" 
                                                    className={`w-32 bg-slate-950 border rounded px-3 py-2 text-right text-white font-mono text-base outline-none transition-all placeholder:text-slate-700 shadow-inner ${
                                                        isFocused 
                                                        ? 'border-indigo-500 ring-1 ring-indigo-500/20 bg-indigo-900/10' 
                                                        : 'border-slate-700 hover:border-slate-500 focus:border-indigo-500'
                                                    }`}
                                                    value={val !== undefined ? val : ""} 
                                                    placeholder="0" 
                                                    onFocus={() => setFocusedField(met)}
                                                    onBlur={() => setFocusedField(null)}
                                                    onChange={(e) => handleInputChange(met, e.target.value)} 
                                                  />
                                              )}
                                          </div>
                                      )
                                  })}
                              </div>
                          </div>
                      )})}
                  </div>
              </div>
          </div>
      </div>
    )
};