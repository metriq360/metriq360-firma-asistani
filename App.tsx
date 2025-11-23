
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Briefcase, FileText, Settings, Database, ShoppingBag, Zap, Share2, Filter, FileBarChart, Menu, X, Building2, WifiOff, Wifi, LayoutGrid, MapPin
} from 'lucide-react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId } from './services/firebaseService.ts';
import { callGemini } from './services/geminiService.ts';
import { generateSampleData, getDateKey, KPI_STRUCTURE } from './constants.ts';
import { SidebarItem, FloatingAIButton } from './components/LayoutComponents.tsx';
import { 
    AgencyHomeView, DashboardView, AdsView, SocialView, WebView, SalesView, CompaniesView, BackupView, SettingsView, KPIAnalysisCardsView, LocalVisibilityView
} from './components/views/DashboardViews.tsx';
import { DataEntryView } from './components/views/DataEntryView.tsx';
import { AnnualAnalysisView } from './components/views/AnalysisView.tsx';
import { ProductAnalysisView } from './components/views/ProductAnalysisView.tsx';
import { AiAssistantView } from './components/views/AiAssistantView.tsx';
import { AppData, Company } from './types.ts';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  
  // INITIALIZE STATE FROM LOCALSTORAGE OR DEFAULT
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const localData = localStorage.getItem('metriq360_local_data');
      if (localData) {
          const parsed = JSON.parse(localData);
          // Basic validation
          if (parsed.companies && parsed.db && Array.isArray(parsed.companies)) {
              parsed.companies.forEach((c: Company) => {
                  if(!parsed.db[c.id]) parsed.db[c.id] = {};
              });
              return parsed;
          }
      }
      return generateSampleData();
    } catch (e) {
      console.error("Error loading local data, resetting:", e);
      return generateSampleData();
    }
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(() => {
     try {
        const saved = localStorage.getItem('metriq360_selected_comp');
        if (saved && appData.companies.some(c => c.id === parseInt(saved))) {
            return parseInt(saved);
        }
        return appData.companies.length > 0 ? appData.companies[0].id : null;
     } catch (e) {
        return appData.companies.length > 0 ? appData.companies[0].id : null;
     }
  });

  const [selectedDate, setSelectedDate] = useState({ year: 2025, month: 11 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // AI STATE
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // UNSAVED CHANGES TRACKING
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isFirstRun = useRef(true);

  // CHAT HISTORY WITH PERSISTENCE & LIMITS
  const [chatHistory, setChatHistory] = useState(() => {
      try {
          const savedChat = localStorage.getItem('metriq360_chat_history');
          if (savedChat) {
              return JSON.parse(savedChat);
          }
      } catch (e) {
          console.error("Chat load error", e);
      }
      return [{ role: 'bot', text: '**Metriq Analist Hazır!**\nVerilerinizi inceledim. Sadece raporlamak için değil, gözden kaçan detayları yakalamak için buradayım. Neyi analiz etmemi istersiniz?', timestamp: new Date().toISOString() }];
  });

  // Save chat history whenever it changes, BUT limit to last 50 items
  useEffect(() => {
      try {
          // Optimization: Keep only the last 50 messages to prevent localStorage bloat
          const MAX_HISTORY_LENGTH = 50;
          const historyToSave = chatHistory.length > MAX_HISTORY_LENGTH 
            ? chatHistory.slice(chatHistory.length - MAX_HISTORY_LENGTH) 
            : chatHistory;
            
          localStorage.setItem('metriq360_chat_history', JSON.stringify(historyToSave));
      } catch (e) {
          console.error("Chat save error", e);
      }
  }, [chatHistory]);

  const [user, setUser] = useState<any>(null);
  const [isOnlineMode, setIsOnlineMode] = useState(false);

  // AUTO-SAVE TO LOCALSTORAGE & MARK UNSAVED
  useEffect(() => {
    // Skip the initial mount to avoid marking as unsaved immediately after load
    if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
    }

    try {
        localStorage.setItem('metriq360_local_data', JSON.stringify(appData));
        // Mark as dirty when data changes
        setHasUnsavedChanges(true);
    } catch(e) {
        console.error("LocalStorage Save Error (Quota exceeded?)", e);
    }
  }, [appData]);

  // PREVENT ACCIDENTAL TAB CLOSE IF UNSAVED
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = ''; // Chrome requires this to be set
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (selectedCompanyId) {
        localStorage.setItem('metriq360_selected_comp', selectedCompanyId.toString());
    }
  }, [selectedCompanyId]);

  // AUTH & FIREBASE SYNC
  useEffect(() => {
    const init = async () => {
      if (!auth) return;
      try {
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
            await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
            await signInAnonymously(auth);
        }
      } catch (e) {
        console.warn("Offline Mode: Auth skipped");
      }
    };
    init();

    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setIsOnlineMode(true);
    });
    return () => unsubscribe();
  }, []);

  const currentCompany = appData.companies.find((c: Company) => c.id === selectedCompanyId);
  const currentCompanyName = currentCompany ? currentCompany.name : "Firma Seçilmedi";
  
  const getCurrentData = (companyId = selectedCompanyId) => {
    if (!companyId) return {};
    const key = getDateKey(selectedDate.year, selectedDate.month);
    return appData.db[companyId]?.[key] || {};
  };

  const getPrevMonthData = (companyId = selectedCompanyId) => {
    if (!companyId) return {};
    let y = selectedDate.year;
    let m = selectedDate.month - 1;
    if (m === 0) { m = 12; y -= 1; }
    const key = getDateKey(y, m);
    return appData.db[companyId]?.[key] || {};
  };

  const getYearlyTrendData = (companyId = selectedCompanyId) => {
    if (!companyId) return [];
    const trend = [];
    for (let m = 1; m <= 12; m++) {
      const key = getDateKey(selectedDate.year, m);
      const val = appData.db[companyId]?.[key] || {};
      trend.push({ 
        month: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"][m-1],
        ...val
      });
    }
    return trend;
  };

  // --- GLOBAL AI LOGIC ---
  const handleAiChat = async (overrideMsg?: string) => {
    const msgToSend = overrideMsg || aiMessage;
    if(!msgToSend) return;
    
    if (!isAiPanelOpen) setIsAiPanelOpen(true);

    const userMsg = { role: 'user', text: msgToSend, timestamp: new Date().toISOString() };
    setChatHistory((prev: any) => [...prev, userMsg]);
    setAiMessage("");
    setIsAiThinking(true);

    // 1. Prepare Context Data (Current AND Previous Month for Trends)
    let currentContext: any = {};
    let previousContext: any = {};
    let contextDescription = "";
    
    const monthlyData = getCurrentData(selectedCompanyId || undefined);
    const prevMonthlyData = getPrevMonthData(selectedCompanyId || undefined);

    const filterKeys = (data: any, keyword: string) => {
        const result: any = {};
        Object.keys(data || {}).forEach(k => {
            if(k.includes(keyword)) result[k] = data[k];
        });
        return result;
    };

    switch(activePage) {
        case 'product_analysis':
            contextDescription = "Ürün Analizi ve Stok Yönetimi";
            currentContext = {
                products: monthlyData.product_sales || [],
                totalRevenue: monthlyData["SAL - Toplam Tutar Ciro"],
                totalItems: monthlyData["SAL - Toplam Satılan Ürün Adet"]
            };
            previousContext = {
                products: prevMonthlyData.product_sales || [],
                totalRevenue: prevMonthlyData["SAL - Toplam Tutar Ciro"],
                totalItems: prevMonthlyData["SAL - Toplam Satılan Ürün Adet"]
            };
            break;
        case 'ads':
            contextDescription = "Reklam Performansı (Google Ads & Meta Ads)";
            currentContext = filterKeys(monthlyData, "ADS -");
            previousContext = filterKeys(prevMonthlyData, "ADS -");
            break;
        case 'sales':
            contextDescription = "Satış, Finans ve Karlılık";
            currentContext = { ...filterKeys(monthlyData, "SAL -"), ...filterKeys(monthlyData, "Ciro") };
            previousContext = { ...filterKeys(prevMonthlyData, "SAL -"), ...filterKeys(prevMonthlyData, "Ciro") };
            break;
        case 'social':
            contextDescription = "Sosyal Medya ve Topluluk";
            currentContext = filterKeys(monthlyData, "SM -");
            previousContext = filterKeys(prevMonthlyData, "SM -");
            break;
        case 'local_seo':
            contextDescription = "Yerel Görünürlük (Google İşletme Profili & SEO)";
            currentContext = { ...filterKeys(monthlyData, "GBP-"), ...filterKeys(monthlyData, "SEO-") };
            previousContext = { ...filterKeys(prevMonthlyData, "GBP-"), ...filterKeys(prevMonthlyData, "SEO-") };
            break;
        case 'web':
            contextDescription = "Web Sitesi Trafiği ve Dönüşüm Hunisi";
            currentContext = filterKeys(monthlyData, "WEB-");
            previousContext = filterKeys(prevMonthlyData, "WEB-");
            break;
        case 'kpi_cards':
            contextDescription = "Tüm KPI Metrikleri Genel Bakış";
            currentContext = monthlyData;
            previousContext = prevMonthlyData;
            break;
        default:
            contextDescription = "Genel Yönetim Paneli (Özet)";
            currentContext = monthlyData; // Send all for dashboard
            previousContext = prevMonthlyData;
            break;
    }
    
    const companyName = appData.companies.find((c: Company) => c.id === selectedCompanyId)?.name || "Seçili Firma";
    
    // --- CRITICAL FIX: MEMORY INJECTION ---
    // Sohbet geçmişinin son 6 mesajını alıp prompt'a ekliyoruz.
    // Bu sayede AI, "bunun", "önceki", "o ürün" gibi atıfları anlayabilir.
    const recentHistory = chatHistory.slice(-6).map((msg: any) => {
        return `${msg.role === 'user' ? 'KULLANICI' : 'METRIQ ASİSTAN'}: ${msg.text}`;
    }).join('\n\n');

    // 2. Enhanced Prompt Engineering
    const prompt = `
      [BAĞLAM BİLGİSİ]
      Kullanıcı Sayfası: ${contextDescription}
      Firma: ${companyName}
      Dönem: ${selectedDate.month}/${selectedDate.year}
      
      [GEÇMİŞ SOHBET (HAFIZA)]
      (Kullanıcı 'bunun', 'o', 'önceki' derse buraya bak)
      ${recentHistory}

      [YENİ KULLANICI MESAJI]
      "${msgToSend}"

      [MEVCUT VERİLER (SADECE GEREKİRSE KULLAN)]
      Şu Anki Ay: ${JSON.stringify(currentContext)}
      Geçen Ay: ${JSON.stringify(previousContext)}

      [GÖREV VE TALİMATLAR]
      1. **SOHBET SÜREKLİLİĞİ:** Önceki mesajları mutlaka oku. Kullanıcı "bunun satışını nasıl artırırız" derse, önceki mesajda hangi üründen (örn: Kışlık Kaban) bahsettiğimizi hatırla ve ona göre cevap ver.
      2. **DOĞAL OL:** Robot gibi rapor sunma. "Verilere baktığımda..." deme. Doğrudan konuya gir.
      3. **SADECE SORULANI CEVAPLA:** Kullanıcı "Merhaba" dediyse verileri dökme, sadece selam ver. Kullanıcı "En çok satan ne?" dediyse sadece o ürünü söyle.
      4. **BAĞLAMA UYGUNLUK:** Bulunduğun sayfa haricindeki konulardan (Kullanıcı sormadıkça) bahsetme.

      Cevabı Markdown formatında ver.
    `;

    try {
        const responseText = await callGemini(prompt);
        setChatHistory((prev: any) => [...prev, { role: 'bot', text: responseText, timestamp: new Date().toISOString() }]);
    } catch (e) {
        setChatHistory((prev: any) => [...prev, { role: 'bot', text: "Bağlantı hatası. Lütfen tekrar deneyin.", timestamp: new Date().toISOString() }]);
    }
    setIsAiThinking(false);
  };

  const handleClearChat = () => {
      if (confirm("Tüm sohbet geçmişi silinecek. Emin misiniz?")) {
          setChatHistory([{ role: 'bot', text: '**Metriq Analist Hazır!**\nGeçmiş temizlendi. Size nasıl yardımcı olabilirim?', timestamp: new Date().toISOString() }]);
      }
  };

  const handleClearData = () => {
      if(window.confirm("DİKKAT: Tüm veriler silinecek. Emin misiniz?")) {
          const empty: AppData = { companies: [], db: {}, products: [] };
          setAppData(empty);
          localStorage.setItem('metriq360_local_data', JSON.stringify(empty));
          setHasUnsavedChanges(true);
          setSelectedCompanyId(null);
          setActivePage('agency_home');
      }
  };

  const PageHeaderProps = {
    companies: appData.companies,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedDate,
    setSelectedDate,
    setActivePage
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden selection:bg-indigo-500 selection:text-white">
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative`}>
         <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <img src="https://i.imgur.com/HVZlPN6.png" alt="Metriq360 Logo" className="w-24 h-24 rounded-xl shadow-lg object-contain bg-slate-950 border border-slate-800" />
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Metriq360</h1>
                {isOnlineMode ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1 w-fit"><Wifi size={10}/> Online</span>
                ) : (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1 w-fit"><WifiOff size={10}/> Offline (PC)</span>
                )}
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-slate-400"><X/></button>
         </div>
         <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-2 tracking-wider">Ajans</div>
            <SidebarItem id="agency_home" label="Ajans Kokpiti" icon={Building2} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
            
            <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-2 mt-6 tracking-wider">Müşteri Detay</div>
            {selectedCompanyId ? (
               <>
                <SidebarItem id="dashboard" label="Özet Panel" icon={LayoutDashboard} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="analysis" label="Yıllık Analiz" icon={FileBarChart} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="product_analysis" label="Ürün Analizi" icon={ShoppingBag} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="kpi_cards" label="KPI Analiz Kartları" icon={LayoutGrid} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="ads" label="Reklam (Ads)" icon={Zap} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="social" label="Sosyal Medya" icon={Share2} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="local_seo" label="Yerel Görünürlük" icon={MapPin} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="web" label="Web & Huni" icon={Filter} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="sales" label="Satış & Finans" icon={Briefcase} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
                <SidebarItem id="entry" label="Veri Girişi" icon={FileText} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
               </>
            ) : (<div className="px-4 py-3 border border-dashed border-slate-700 rounded-lg text-xs text-slate-400 text-center">Detaylar için bir müşteri seçin.</div>)}
            <div className="text-xs font-bold text-slate-500 uppercase px-2 mb-2 mt-6 tracking-wider">Sistem</div>
            <SidebarItem id="companies" label="Firmalar" icon={Briefcase} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem id="backup" label="Veri & Yedekleme" icon={Database} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} alert={hasUnsavedChanges} />
            <SidebarItem id="settings" label="Ayarlar" icon={Settings} activePage={activePage} setActivePage={setActivePage} setIsSidebarOpen={setIsSidebarOpen} />
         </nav>
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-950">
         {/* Mobile Header */}
         <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40"><button onClick={() => setIsSidebarOpen(true)}><Menu className="text-white"/></button><span className="font-bold text-white">Metriq360</span></div>
         
         {/* Main Content */}
         <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-800 relative">
            <div className="max-w-7xl mx-auto">
               {activePage === 'agency_home' && <AgencyHomeView appData={appData} getCurrentData={getCurrentData} setSelectedCompanyId={setSelectedCompanyId} setActivePage={setActivePage} PageHeaderProps={PageHeaderProps} handleClearData={handleClearData} />}
               {activePage === 'dashboard' && <DashboardView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} currentCompanyName={currentCompanyName} />}
               {activePage === 'analysis' && <AnnualAnalysisView appData={appData} selectedCompanyId={selectedCompanyId} selectedDate={selectedDate} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'product_analysis' && <ProductAnalysisView appData={appData} setAppData={setAppData} selectedCompanyId={selectedCompanyId} selectedDate={selectedDate} setSelectedDate={setSelectedDate} PageHeaderProps={PageHeaderProps} user={user} />}
               {activePage === 'kpi_cards' && <KPIAnalysisCardsView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'ads' && <AdsView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'social' && <SocialView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'local_seo' && <LocalVisibilityView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'web' && <WebView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'sales' && <SalesView currentData={getCurrentData()} prevData={getPrevMonthData()} trendData={getYearlyTrendData()} PageHeaderProps={PageHeaderProps} />}
               {activePage === 'entry' && <DataEntryView KPI_STRUCTURE={KPI_STRUCTURE} getCurrentData={getCurrentData} getPrevMonthData={getPrevMonthData} selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedCompanyId={selectedCompanyId} appData={appData} setAppData={setAppData} getDateKey={getDateKey} user={user} />}
               {activePage === 'companies' && <CompaniesView appData={appData} PageHeaderProps={PageHeaderProps} setAppData={setAppData} user={user} />}
               {activePage === 'backup' && <BackupView PageHeaderProps={PageHeaderProps} appData={appData} setAppData={setAppData} user={user} hasUnsavedChanges={hasUnsavedChanges} setHasUnsavedChanges={setHasUnsavedChanges} />}
               {activePage === 'settings' && <SettingsView PageHeaderProps={PageHeaderProps} />}
               
               {activePage === 'ai' && <AiAssistantView PageHeaderProps={PageHeaderProps} chatHistory={chatHistory} aiMessage={aiMessage} setAiMessage={setAiMessage} handleAiChat={handleAiChat} isAiThinking={isAiThinking} onClearChat={handleClearChat} />}
            </div>
         </main>

         {/* GLOBAL AI FAB & SLIDE-OVER PANEL */}
         {activePage !== 'ai' && (
             <>
                <FloatingAIButton onClick={() => setIsAiPanelOpen(!isAiPanelOpen)} isOpen={isAiPanelOpen} />
                
                <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] h-[100dvh] bg-slate-950 shadow-2xl border-l border-slate-800 transform transition-transform duration-300 ease-in-out z-[60] ${isAiPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <AiAssistantView 
                        mode="panel"
                        chatHistory={chatHistory}
                        aiMessage={aiMessage}
                        setAiMessage={setAiMessage}
                        handleAiChat={handleAiChat}
                        isAiThinking={isAiThinking}
                        onClose={() => setIsAiPanelOpen(false)}
                        onClearChat={handleClearChat}
                    />
                </div>
                {isAiPanelOpen && <div className="fixed inset-0 bg-black/50 z-[55] md:hidden" onClick={() => setIsAiPanelOpen(false)}></div>}
             </>
         )}
      </div>
    </div>
  );
}
    