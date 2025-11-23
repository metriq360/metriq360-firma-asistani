
import React from 'react';
import { 
  Building2, CheckCircle, ChevronLeft, ChevronRight, Calendar, Activity, TrendingUp, TrendingDown, Bot
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { fmtCurrency, fmtNum, fmtPercent } from '../constants.ts';
import { Company, SelectedDate, PageHeaderProps } from '../types.ts';

export const SidebarItem = ({ id, label, icon: Icon, activePage, setActivePage, setIsSidebarOpen, alert }: any) => (
  <button 
    onClick={() => { setActivePage(id); if(window.innerWidth < 768 && setIsSidebarOpen) setIsSidebarOpen(false); }} 
    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${activePage === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
  >
    <div className="flex items-center gap-3">
        <Icon size={18} className={activePage === id ? "text-white" : "text-slate-500 group-hover:text-white"}/> 
        {label}
    </div>
    {alert && (
        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
    )}
  </button>
);

export const FloatingAIButton = ({ onClick, isOpen }: { onClick: () => void, isOpen: boolean }) => (
    <button 
        onClick={onClick}
        className={`fixed bottom-6 right-6 z-[70] p-4 rounded-2xl shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group ${isOpen ? 'bg-slate-800 text-slate-400 rotate-90' : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'}`}
        title="Metriq AI Asistan"
    >
        {isOpen ? (
             <ChevronRight size={28} />
        ) : (
            <>
                <Bot size={28} className="relative z-10" />
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
                <div className="absolute inset-0 rounded-2xl bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </>
        )}
    </button>
);

export const EnhancedKPICard = ({ title, val, prev, type, trendData, dataKey, color = "#818cf8" }: any) => {
    const change = prev ? ((val - prev) / prev) * 100 : 0;
    const isGood = change >= 0; 

    return (
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
                <div>
                    {/* UPDATED: More prominent title styles */}
                    <p className="text-slate-200 text-sm uppercase tracking-widest font-extrabold mb-2 shadow-black drop-shadow-md opacity-90">{title}</p>
                    <div className="text-3xl font-bold text-white tracking-tight">
                        {type === 'currency' ? fmtCurrency(val) : (type === 'percent' ? fmtPercent(val) : fmtNum(val))}
                    </div>
                    <div className={`text-xs mt-2 font-bold flex items-center gap-1 ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {change > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                        {Math.abs(change).toFixed(1)}% <span className="text-slate-500 font-normal">geçen aya göre</span>
                    </div>
                </div>
                <div className={`p-2 rounded-lg ${isGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <Activity size={20}/>
                </div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                                <stop offset="100%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#grad-${dataKey})`} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const PeriodSelector = ({ selectedDate, setSelectedDate }: { selectedDate: SelectedDate, setSelectedDate: (d: SelectedDate) => void }) => (
  <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1">
    <button onClick={() => { let m = selectedDate.month - 1, y = selectedDate.year; if (m === 0) { m = 12; y -= 1; } setSelectedDate({ year: y, month: m }); }} className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white"><ChevronLeft size={20}/></button>
    <div className="px-4 text-center min-w-[140px]">
      <div className="text-xs text-slate-500 font-bold uppercase">Dönem</div>
      <div className="text-white font-bold flex items-center justify-center gap-2"><Calendar size={16} className="text-indigo-400"/> {["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][selectedDate.month - 1]} {selectedDate.year}</div>
    </div>
    <button onClick={() => { let m = selectedDate.month + 1, y = selectedDate.year; if (m === 13) { m = 1; y += 1; } setSelectedDate({ year: y, month: m }); }} className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white"><ChevronRight size={20}/></button>
  </div>
);

export const CompanySelector = ({ companies, selectedCompanyId, setSelectedCompanyId, setActivePage }: any) => {
  const currentCompany = companies.find((c: Company) => c.id === selectedCompanyId);
  return (
    <div className="relative group">
      <button className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg w-full md:w-64 transition-all">
        <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-sm font-bold">{currentCompany ? currentCompany.name.substring(0,2) : "AJ"}</div>
        <div className="text-left flex-1 overflow-hidden">
          <div className="text-xs text-slate-400">Görüntülenen</div>
          <div className="font-bold truncate">{currentCompany ? currentCompany.name : "Ajans Paneli"}</div>
        </div>
        <ChevronRight className="rotate-90 group-hover:rotate-[-90deg] transition-transform" size={16}/>
      </button>
      <div className="absolute top-full left-0 w-full bg-slate-800 border border-slate-700 rounded-lg mt-1 hidden group-hover:block z-50 shadow-xl">
        <button onClick={() => {setSelectedCompanyId(null); setActivePage('agency_home')}} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 text-sm border-b border-slate-700 flex items-center gap-2">
          <Building2 size={16}/> Ajans Genel Bakış
        </button>
        {companies.map((c: Company) => (
          <button key={c.id} onClick={() => {setSelectedCompanyId(c.id); setActivePage('dashboard');}} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 text-sm border-b border-slate-700 last:border-0 flex justify-between">
            {c.name}{c.id === selectedCompanyId && <CheckCircle size={14} className="text-green-400"/>}
          </button>
        ))}
      </div>
    </div>
  );
};

export const PageHeader = ({ title, sub, companies, selectedCompanyId, setSelectedCompanyId, selectedDate, setSelectedDate, setActivePage }: any) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 gap-4">
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div><h2 className="text-3xl font-bold text-white">{title}</h2><p className="text-slate-400 text-sm">{sub}</p></div>
      <CompanySelector companies={companies} selectedCompanyId={selectedCompanyId} setSelectedCompanyId={setSelectedCompanyId} setActivePage={setActivePage} />
    </div>
    <PeriodSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
  </div>
);

export const DataEntryPeriodSelector = ({ selectedDate, setSelectedDate }: { selectedDate: SelectedDate, setSelectedDate: (d: SelectedDate) => void }) => (
  <div className="flex items-center justify-center gap-4 bg-slate-800 p-3 rounded-xl border border-slate-700 mb-6">
      <button onClick={() => { let m = selectedDate.month - 1, y = selectedDate.year; if (m === 0) { m = 12; y -= 1; } setSelectedDate({ year: y, month: m }); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronLeft size={24}/></button>
      <div className="text-center min-w-[200px]">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Düzenlenen Dönem</div>
          <div className="text-xl font-bold text-white flex items-center justify-center gap-3"><Calendar size={20} className="text-indigo-500"/> {["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][selectedDate.month - 1]} {selectedDate.year}</div>
      </div>
      <button onClick={() => { let m = selectedDate.month + 1, y = selectedDate.year; if (m === 13) { m = 1; y += 1; } setSelectedDate({ year: y, month: m }); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"><ChevronRight size={24}/></button>
  </div>
);
