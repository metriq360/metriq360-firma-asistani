
import React, { useState, useRef } from 'react';
import { 
  ChevronDown, ChevronRight, Loader2, Sparkles, Bot, X, Printer, FileCode, Download
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { callGemini } from '../../services/geminiService.ts';
import { KPI_STRUCTURE, fmtCurrency, fmtNum } from '../../constants.ts';
import { PageHeader } from '../LayoutComponents.tsx';

export const AnnualAnalysisView = ({ appData, selectedCompanyId, selectedDate, PageHeaderProps }: any) => {
    if (!selectedCompanyId) return <div className="text-center p-10 text-slate-400">Lütfen bir firma seçin.</div>;
    
    const [showReport, setShowReport] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const reportRef = useRef<HTMLDivElement>(null);

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({...prev, [cat]: !prev[cat]}));
    };

    const getRollingMonths = () => {
        const months = [];
        for(let i=11; i>=0; i--) {
            let d = new Date(selectedDate.year, selectedDate.month - 1);
            d.setMonth(d.getMonth() - i);
            months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
        }
        return months;
    };

    const rollingMonths = getRollingMonths();
    const monthNamesShort = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

    const getRollingDataForKPI = (kpi: string) => {
        return rollingMonths.map(m => {
            const key = `${m.year}-${String(m.month).padStart(2, '0')}`;
            return appData.db[selectedCompanyId]?.[key]?.[kpi] || 0;
        });
    };

    const formatValue = (val: number, kpi: string) => {
        if(val === 0) return "-";
        if(kpi.includes("Harcama") || kpi.includes("Ciro") || kpi.includes("Tutar") || kpi.includes("CPC") || kpi.includes("Sepet")) return fmtCurrency(val);
        if(kpi.includes("Oranı") || kpi.includes("ROAS")) return `${val.toFixed(2)}${kpi.includes("ROAS") ? 'x' : '%'}`;
        return fmtNum(val);
    };

    const getStatusLabel = (val: number, prevVal: number, kpi: string) => {
        if(!val || !prevVal) return <span className="text-slate-500">-</span>;
        
        const isInverse = kpi.includes("CPC") || kpi.includes("Maliyet") || kpi.includes("Hemen Çıkma");
        const change = ((val - prevVal) / prevVal) * 100;
        
        let status = "Stabil";
        let color = "text-slate-400 bg-slate-800";

        if (isInverse) {
            if (change < -20) { status = "Süper"; color = "text-emerald-400 bg-emerald-500/20"; }
            else if (change < -5) { status = "İyi"; color = "text-green-400 bg-green-500/20"; }
            else if (change > 20) { status = "ACİL"; color = "text-red-100 bg-red-600 animate-pulse font-bold"; }
            else if (change > 5) { status = "Müdahale"; color = "text-orange-400 bg-orange-500/20"; }
            else { status = "Geliştir"; color = "text-blue-400 bg-blue-500/20"; }
        } else {
            if (change > 20) { status = "Süper"; color = "text-emerald-400 bg-emerald-500/20"; }
            else if (change > 5) { status = "İyi"; color = "text-green-400 bg-green-500/20"; }
            else if (change < -20) { status = "ACİL"; color = "text-red-100 bg-red-600 animate-pulse font-bold"; }
            else if (change < -5) { status = "Müdahale"; color = "text-orange-400 bg-orange-500/20"; }
            else { status = "Geliştir"; color = "text-blue-400 bg-blue-500/20"; }
        }

        return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${color}`}>{status}</span>;
    };

    const getChangePercent = (val: number, prevVal: number) => {
        if(!val || !prevVal) return "-";
        const change = ((val - prevVal) / prevVal) * 100;
        return (
            <span className={`text-xs font-bold ${change > 0 ? 'text-emerald-400' : (change < 0 ? 'text-red-400' : 'text-slate-400')}`}>
                {change > 0 ? '↑' : (change < 0 ? '↓' : '')} {Math.abs(change).toFixed(1)}%
            </span>
        );
    };

    const getCellColor = (val: number, avg: number, kpi: string) => {
        if (!val) return '';
        const isInverse = kpi.includes("CPC") || kpi.includes("Maliyet") || kpi.includes("Hemen Çıkma");
        const percentDiff = avg > 0 ? ((val - avg) / avg) * 100 : 0;

        if (isInverse) {
             if (percentDiff < -20) return 'bg-emerald-500/40 text-emerald-100 font-bold'; 
             if (percentDiff < -5) return 'bg-emerald-500/20 text-emerald-200';
             if (percentDiff > 20) return 'bg-rose-500/40 text-rose-100 font-bold'; 
             if (percentDiff > 5) return 'bg-rose-500/20 text-rose-200';
        } else {
             if (percentDiff > 20) return 'bg-emerald-500/40 text-emerald-100 font-bold';
             if (percentDiff > 5) return 'bg-emerald-500/20 text-emerald-200';
             if (percentDiff < -20) return 'bg-rose-500/40 text-rose-100 font-bold';
             if (percentDiff < -5) return 'bg-rose-500/20 text-rose-200';
        }
        return 'text-slate-400';
    };

    const generateReport = async () => {
        setIsGenerating(true);
        const company = appData.companies.find((c: any) => c.id === selectedCompanyId);
        const companyName = company?.name;
        const companyIndustry = company?.industry || "Genel";

        const last12MonthsData: any = {};
        // Daha kapsamlı veri seti gönderelim
        const keyMetrics = [
            "SAL - Toplam Tutar Ciro", 
            "SAL - Toplam Net Kar",
            "ADS - TOP Reklam Harcama Getirisi (ROAS)", 
            "ADS - TOP Toplam Reklam Harcaması",
            "SAL - Toplam Satılan Ürün Adet"
        ];
        keyMetrics.forEach(kpi => {
            last12MonthsData[kpi] = getRollingDataForKPI(kpi);
        });

        const prompt = `
          Sen Dünyanın önde gelen bir "Dijital Dönüşüm ve Büyüme Stratejisti"sin. Görevin, aşağıda verileri sunulan firma için üst yönetim seviyesinde (C-Level) profesyonel, yapıcı ve vizyoner bir yıllık performans raporu hazırlamak.

          Analiz Edilecek Firma: ${companyName}
          Sektör: ${companyIndustry}
          Dönem: ${rollingMonths[0].month}/${rollingMonths[0].year} - ${rollingMonths[11].month}/${rollingMonths[11].year} (Son 12 Ay)
          
          HAM VERİLER: ${JSON.stringify(last12MonthsData)}
          
          Analiz Kuralları:
          1. Dilin profesyonel, akıcı ve kurumsal olsun. "Huysuz" olma, "Danışman" ol.
          2. Verilerdeki anormallikleri (örneğin ROAS ve Ciro arasındaki garip ilişkileri) "Veri Hijyeni Uyarısı" olarak nazikçe belirt ama asıl odağın strateji olsun.
          3. Sezonsallığı yorumla.
          4. Raporu HTML formatında değil, JSON formatında döndür.

          ÇIKTI FORMATI (JSON):
          {
            "summary": "Yönetici özeti (Executive Summary). Durumu 3-4 cümlede özetle.",
            "highlights": ["Başarı 1", "Başarı 2", "Fırsat 1"],
            "warnings": ["Risk 1", "Dikkat edilmesi gereken nokta 1"],
            "strategy": ["Stratejik Tavsiye 1 (Aksiyon odaklı)", "Stratejik Tavsiye 2"]
          }
        `;

        try {
            const aiResponse = await callGemini(prompt);
            const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedReport = JSON.parse(cleanedResponse);
            setReportData(parsedReport);
            setShowReport(true);
        } catch (e) {
            console.error("Rapor oluşturma hatası", e);
            alert("Yapay zeka şu an yoğun veya yanıt ayrıştırılamadı. Lütfen tekrar deneyin.");
        }
        setIsGenerating(false);
    };

    const handlePrint = () => {
        if (!reportData) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const companyName = appData.companies.find((c: any) => c.id === selectedCompanyId)?.name;
            printWindow.document.write(`
                <html>
                <head>
                    <title>Yıllık Performans Raporu - ${companyName}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; max-width: 900px; mx-auto; }
                        h1 { color: #4f46e5; font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; }
                        h2 { color: #334155; font-size: 20px; margin-top: 30px; margin-bottom: 10px; font-weight: 700; }
                        p { line-height: 1.6; font-size: 14px; margin-bottom: 15px; }
                        .box { padding: 20px; border-radius: 8px; margin-bottom: 20px; page-break-inside: avoid; }
                        .green { background-color: #f0fdf4; border-left: 5px solid #22c55e; }
                        .red { background-color: #fef2f2; border-left: 5px solid #ef4444; }
                        .blue { background-color: #eff6ff; border-left: 5px solid #3b82f6; }
                        ul { padding-left: 20px; margin: 0; }
                        li { margin-bottom: 8px; font-size: 14px; }
                        .meta { color: #64748b; font-size: 12px; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <h1>Yıllık Stratejik Performans Raporu</h1>
                    <div class="meta">
                        <strong>Firma:</strong> ${companyName}<br>
                        <strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}<br>
                        <strong>Kaynak:</strong> Metriq360 AI Analysis
                    </div>

                    <h2>Yönetici Özeti</h2>
                    <p>${reportData.summary}</p>

                    <div class="box green">
                        <h3 style="margin-top:0; color:#15803d">Öne Çıkanlar & Fırsatlar</h3>
                        <ul>
                            ${reportData.highlights.map((h: string) => `<li>${h}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="box red">
                        <h3 style="margin-top:0; color:#b91c1c">Riskler & Uyarılar</h3>
                        <ul>
                            ${reportData.warnings.map((h: string) => `<li>${h}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="box blue">
                        <h3 style="margin-top:0; color:#1d4ed8">Stratejik Yol Haritası</h3>
                        <ul>
                            ${reportData.strategy ? reportData.strategy.map((h: string) => `<li>${h}</li>`).join('') : ''}
                        </ul>
                    </div>
                    
                    <script>window.print();</script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleDownloadHtml = () => {
        if (!reportData) return;
        const companyName = appData.companies.find((c: any) => c.id === selectedCompanyId)?.name;
        const htmlContent = `
            <html>
            <head>
                <meta charset="utf-8">
                <title>Rapor - ${companyName}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; background: #f9fafb; }
                    .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    h1 { color: #4f46e5; margin-top: 0; }
                    .section { margin-bottom: 30px; padding: 20px; border-radius: 8px; }
                    .highlights { background: #f0fdf4; border: 1px solid #bbf7d0; }
                    .warnings { background: #fef2f2; border: 1px solid #fecaca; }
                    .strategy { background: #eff6ff; border: 1px solid #bfdbfe; }
                    li { margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Metriq360 - Stratejik Analiz Raporu</h1>
                    <p><strong>Firma:</strong> ${companyName}</p>
                    <p><strong>Oluşturulma Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
                    <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;">
                    
                    <h3>Yönetici Özeti</h3>
                    <p>${reportData.summary}</p>

                    <div class="section highlights">
                        <h3>Öne Çıkanlar</h3>
                        <ul>${reportData.highlights.map((h:string) => `<li>${h}</li>`).join('')}</ul>
                    </div>

                    <div class="section warnings">
                        <h3>Riskler ve Tespitler</h3>
                        <ul>${reportData.warnings.map((h:string) => `<li>${h}</li>`).join('')}</ul>
                    </div>
                    
                    <div class="section strategy">
                        <h3>Stratejik Öneriler</h3>
                        <ul>${reportData.strategy ? reportData.strategy.map((h:string) => `<li>${h}</li>`).join('') : ''}</ul>
                    </div>
                </div>
            </body>
            </html>
        `;
        const element = document.createElement("a");
        const file = new Blob([htmlContent], {type: 'text/html'});
        element.href = URL.createObjectURL(file);
        element.download = `Rapor_${companyName}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const totalRevenue = getRollingDataForKPI("SAL - Toplam Tutar Ciro").reduce((a,b)=>a+b,0);
    const totalSpend = getRollingDataForKPI("ADS - TOP Toplam Reklam Harcaması").reduce((a,b)=>a+b,0);
    const avgRoas = getRollingDataForKPI("ADS - TOP Reklam Harcama Getirisi (ROAS)").filter(v=>v>0).reduce((a,b,_,arr)=>a+b/arr.length,0);
    const totalProfit = getRollingDataForKPI("SAL - Toplam Net Kar").reduce((a,b)=>a+b,0);

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-[1800px] mx-auto">
            <div className="flex justify-between items-end mb-2">
                <PageHeader {...PageHeaderProps} title="Yıllık Performans Analizi" sub="Isı Haritası ve Trend Analizi (Son 12 Ay)" />
                {!showReport && (
                    <button onClick={generateReport} disabled={isGenerating} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:scale-105 transition-transform disabled:opacity-70">
                        {isGenerating ? <><Loader2 className="animate-spin"/> Strateji Oluşturuluyor...</> : <><Sparkles size={20}/> AI Stratejik Rapor Oluştur</>}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Son 12 Ay Ciro</div>
                    <div className="text-3xl font-bold text-emerald-400 mt-2">{fmtCurrency(totalRevenue)}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Son 12 Ay Harcama</div>
                    <div className="text-3xl font-bold text-blue-400 mt-2">{fmtCurrency(totalSpend)}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ortalama ROAS</div>
                    <div className="text-3xl font-bold text-purple-400 mt-2">{avgRoas.toFixed(2)}x</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Toplam Net Kar</div>
                    <div className="text-3xl font-bold text-white mt-2">{fmtCurrency(totalProfit)}</div>
                </div>
            </div>

            {showReport && reportData && (
                 <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 mb-8 shadow-2xl animate-fade-in relative">
                    <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
                                <Bot className="text-indigo-400"/> Stratejik Performans Raporu
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Metriq AI &bull; Kıdemli Stratejist Görüşü</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={handlePrint} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors" title="Yazdır">
                                <Printer size={20}/>
                             </button>
                             <button onClick={handleDownloadHtml} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors" title="HTML İndir">
                                <FileCode size={20}/>
                             </button>
                             <button onClick={() => setShowReport(false)} className="p-2 hover:bg-rose-900/30 rounded-lg text-slate-400 hover:text-rose-400 transition-colors ml-2">
                                <X size={20}/>
                             </button>
                        </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 mb-8">
                            <h4 className="text-indigo-300 font-bold mb-3 uppercase text-sm tracking-wider">Yönetici Özeti</h4>
                            <p className="text-lg leading-relaxed text-slate-200">{reportData.summary}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="bg-emerald-900/10 p-6 rounded-xl border border-emerald-500/20">
                                 <h4 className="text-emerald-400 font-bold mb-4 flex items-center gap-2"><Sparkles size={18}/> Öne Çıkanlar</h4>
                                 <ul className="space-y-2">
                                     {reportData.highlights.map((h: string, i: number) => (
                                         <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                             {h}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                             
                             <div className="bg-rose-900/10 p-6 rounded-xl border border-rose-500/20">
                                 <h4 className="text-rose-400 font-bold mb-4 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div> Riskler & Uyarılar</h4>
                                 <ul className="space-y-2">
                                     {reportData.warnings.map((h: string, i: number) => (
                                         <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                             {h}
                                         </li>
                                     ))}
                                 </ul>
                             </div>

                             <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20">
                                 <h4 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><ChevronRight size={18}/> Stratejik Aksiyonlar</h4>
                                 <ul className="space-y-2">
                                     {reportData.strategy && reportData.strategy.map((h: string, i: number) => (
                                         <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                             {h}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                        </div>
                    </div>
                 </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-slate-700 shadow-2xl bg-slate-900 relative max-h-[800px] flex flex-col">
                <div className="overflow-auto w-full scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800/50">
                    <table className="w-full text-left border-collapse relative min-w-[2000px]">
                        <thead className="sticky top-0 z-50 bg-slate-950 shadow-xl">
                            <tr className="text-xs uppercase text-slate-400 font-bold border-b border-slate-800">
                                <th className="p-4 sticky left-0 bg-slate-950 z-50 min-w-[250px] border-r border-slate-800 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]">Metrik</th>
                                {rollingMonths.map((m, i) => (
                                    <th key={i} className={`p-3 text-center min-w-[100px] border-r border-slate-800/50 ${i === 11 ? 'bg-indigo-600 text-white' : ''}`}>
                                        {monthNamesShort[m.month-1]} <span className="block text-[9px] opacity-60">{m.year}</span>
                                    </th>
                                ))}
                                <th className="p-3 text-center bg-slate-900 min-w-[100px] border-l border-slate-800 text-indigo-300">Ort.</th>
                                <th className="p-3 text-center bg-slate-900 min-w-[120px] border-l border-slate-800">Değişim</th>
                                <th className="p-3 text-center bg-slate-900 min-w-[100px]">Durum</th>
                                <th className="p-3 text-center bg-slate-900 min-w-[140px]">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs md:text-sm font-medium">
                            {Object.entries(KPI_STRUCTURE).map(([mainCat, subCats]: any) => (
                                <React.Fragment key={mainCat}>
                                    <tr 
                                        className="bg-slate-950/80 border-y border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors"
                                        onClick={() => toggleCategory(mainCat)}
                                    >
                                        {/* UPDATED: Main category header style */}
                                        <td colSpan={17} className="p-3 font-extrabold text-indigo-300 text-sm sticky left-0 bg-slate-950/95 z-40 uppercase tracking-widest pl-4 flex items-center gap-2 border-r border-slate-800 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]">
                                            {expandedCategories[mainCat] ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                                            {mainCat}
                                        </td>
                                    </tr>

                                    {expandedCategories[mainCat] && Object.entries(subCats).map(([subCat, metrics]: any) => (
                                        <React.Fragment key={subCat}>
                                            <tr className="bg-slate-900/30 border-b border-slate-800/50">
                                                {/* UPDATED: Sub-category header style */}
                                                <td colSpan={17} className="p-2 pl-8 text-sm font-bold text-slate-200 sticky left-0 bg-slate-900/95 z-30 border-r border-slate-800 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]">
                                                    {subCat}
                                                </td>
                                            </tr>

                                            {metrics.map((met: string) => {
                                                const rollingData = getRollingDataForKPI(met);
                                                const validMonths = rollingData.filter(v => v > 0);
                                                const avg = validMonths.length > 0 ? validMonths.reduce((a,b)=>a+b,0)/validMonths.length : 0;
                                                const sparkData = rollingData.map((v, i) => ({ i, val: v }));
                                                
                                                const lastVal = rollingData[11];
                                                const prevMonthVal = rollingData[10];
                                                const isPositive = lastVal > avg;

                                                return (
                                                    <tr key={met} className="hover:bg-slate-800/50 border-b border-slate-800/50 last:border-0 transition-colors group">
                                                        {/* UPDATED: Metric row header style */}
                                                        <td className="p-3 sticky left-0 bg-slate-900 group-hover:bg-slate-800 border-r border-slate-800 text-white font-bold text-sm truncate max-w-[250px] z-30 pl-8 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.5)]" title={met}>
                                                            {met.split('- ').pop()}
                                                        </td>
                                                        {rollingData.map((val, i) => (
                                                            <td key={i} className={`p-2 text-center border-r border-slate-800/30 ${getCellColor(val, avg, met)} ${i===11 ? 'border-l-2 border-l-indigo-500/50' : ''}`}>
                                                                {formatValue(val, met)}
                                                            </td>
                                                        ))}
                                                        <td className="p-2 text-center bg-slate-900/40 border-l border-slate-800 text-slate-400 font-bold">
                                                            {formatValue(avg, met)}
                                                        </td>
                                                        <td className="p-2 text-center bg-slate-900/40 border-l border-slate-800">
                                                            {getChangePercent(lastVal, prevMonthVal)}
                                                        </td>
                                                        <td className="p-2 text-center bg-slate-900/40">
                                                            {getStatusLabel(lastVal, prevMonthVal, met)}
                                                        </td>
                                                        <td className="p-2 bg-slate-900/40 flex items-center gap-2 justify-end pr-4">
                                                                <div className="h-6 w-16">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart data={sparkData}>
                                                                        <defs>
                                                                            <linearGradient id={`grad-${met}`} x1="0" y1="0" x2="0" y2="1">
                                                                                <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                                                                                <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                                                                            </linearGradient>
                                                                        </defs>
                                                                        <Area type="monotone" dataKey="val" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={1.5} fill={`url(#grad-${met})`} />
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                                </div>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                                {isPositive ? '↑' : '↓'}
                                                                </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}