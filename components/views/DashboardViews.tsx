
import React, { useState } from 'react';
import { 
  Activity, Filter, Plus, Download, Upload, AlertTriangle, Info,
  TrendingUp, TrendingDown, DollarSign, Target, ShoppingCart, 
  Zap, PieChart as PieIcon, BarChart3, Trash2, Edit2, Check, X,
  Building2, 
  LayoutGrid, MessageSquare, Star, Share2, MousePointerClick, HelpCircle,
  Instagram, Facebook, Linkedin, Twitter
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../../services/firebaseService.ts';
import { fmtCurrency, fmtNum, fmtPercent, KPI_STRUCTURE } from '../../constants.ts';
import { PageHeader, EnhancedKPICard } from '../LayoutComponents.tsx';

// --- YARDIMCI BİLEŞENLER ---

const MiniStatCard = ({ title, value, subValue, type, trend, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
                <Icon size={18} />
            </div>
            {trend && (
                <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trend > 0 ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                    %{Math.abs(trend).toFixed(1)}
                </div>
            )}
        </div>
        <div className="text-slate-300 text-sm font-extrabold uppercase tracking-wide mb-2">{title}</div>
        <div className="text-xl font-bold text-white mb-1">
             {type === 'currency' ? fmtCurrency(value) : (type === 'percent' ? fmtPercent(value) : fmtNum(value))}
        </div>
        <div className="text-xs text-slate-500">{subValue}</div>
    </div>
);

const SectionTitle = ({ title, icon: Icon, sub }: any) => (
    <div className="mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Icon size={20} /></div>
            <h3 className="text-white font-bold text-xl">{title}</h3>
        </div>
        {sub && <p className="text-slate-400 text-sm mt-1 ml-11">{sub}</p>}
    </div>
);

const DetailCard = ({ title, children, className = "" }: any) => (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-2xl p-6 ${className}`}>
        {title && <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2"><div className="w-1 h-4 bg-indigo-500 rounded-full"></div>{title}</h4>}
        {children}
    </div>
);

// --- MAIN DASHBOARD VIEW ---

export const DashboardView = ({ currentData, prevData, trendData, PageHeaderProps, currentCompanyName }: any) => {
  
  // Hesaplamalar
  const totalSpend = currentData["ADS - TOP Toplam Reklam Harcaması"] || 0;
  const totalRevenue = currentData["SAL - Toplam Tutar Ciro"] || 0;
  const totalSales = currentData["SAL - Toplam Satılan Ürün Adet"] || 0;
  const newCustomers = currentData["SAL - Toplam Müşteri Sayısı"] || 1; 
  
  // Unit Economics
  const cac = newCustomers > 0 ? totalSpend / newCustomers : 0;
  const aov = currentData["SAL - Ortalama Sepet-Müşteri Değeri Tutarı"] || 0;
  const roas = currentData["ADS - TOP Reklam Harcama Getirisi (ROAS)"] || 0;
  
  const calcTrend = (key: string) => {
      const curr = currentData[key] || 0;
      const prev = prevData[key] || 0;
      return prev === 0 ? 0 : ((curr - prev) / prev) * 100;
  };

  const revenueTrend = calcTrend("SAL - Toplam Tutar Ciro");
  const profitTrend = calcTrend("SAL - Toplam Net Kar");
  const spendTrend = calcTrend("ADS - TOP Toplam Reklam Harcaması");
  const salesTrend = calcTrend("SAL - Toplam Satılan Ürün Adet");

  const channelData = [
      { name: 'Google Ads', value: currentData["ADS - Google Toplam Reklam Harcaması"] || 0, color: '#3b82f6' },
      { name: 'Meta Ads', value: currentData["ADS - Meta Toplam Reklam Harcaması"] || 0, color: '#a855f7' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <PageHeader {...PageHeaderProps} title="Yönetim Paneli" sub={`${currentCompanyName} - Genel Bakış`} />

      {/* 1. ÜST BİLGİ KARTLARI (EXECUTIVE SUMMARY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MiniStatCard title="Toplam Ciro" value={totalRevenue} subValue="Bu ayki toplam gelir" type="currency" trend={revenueTrend} icon={DollarSign} colorClass="text-emerald-400" bgClass="bg-emerald-500/10" />
          <MiniStatCard title="Net Kar" value={currentData["SAL - Toplam Net Kar"]} subValue="Operasyonel kar" type="currency" trend={profitTrend} icon={Target} colorClass="text-blue-400" bgClass="bg-blue-500/10" />
          <MiniStatCard title="Reklam Harcaması" value={totalSpend} subValue="Google + Meta" type="currency" trend={spendTrend} icon={Zap} colorClass="text-orange-400" bgClass="bg-orange-500/10" />
          <MiniStatCard title="ROAS" value={roas} subValue="Verimlilik Çarpanı" type="number" trend={calcTrend("ADS - TOP Reklam Harcama Getirisi (ROAS)")} icon={BarChart3} colorClass="text-purple-400" bgClass="bg-purple-500/10" />
          <MiniStatCard title="Satış Adedi" value={totalSales} subValue="Tamamlanan sipariş" type="number" trend={salesTrend} icon={ShoppingCart} colorClass="text-pink-400" bgClass="bg-pink-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 2. ANA FİNANSAL GRAFİK */}
          <div className="lg:col-span-8 bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <SectionTitle title="Finansal Performans Trendi" icon={Activity} />
                  <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Ciro</div>
                      <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Net Kar</div>
                  </div>
              </div>
              <div className="flex-1 min-h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorRevMain" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                          <linearGradient id="colorProfitMain" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                       <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val/1000}k`} />
                       <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff'}} formatter={(val: any) => fmtCurrency(val)} />
                       <Area type="monotone" dataKey="SAL - Toplam Tutar Ciro" name="Ciro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevMain)" />
                       <Area type="monotone" dataKey="SAL - Toplam Net Kar" name="Net Kar" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfitMain)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
          </div>

          {/* 3. KANAL DAĞILIMI */}
          <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex-1">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2"><PieIcon size={16} className="text-slate-400"/> Harcama Dağılımı</h4>
                  <div className="h-48 relative">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={channelData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {channelData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                  ))}
                              </Pie>
                              <Tooltip formatter={(val: any) => fmtCurrency(val)} contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px'}} />
                          </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className="text-xs text-slate-400">Toplam</div>
                          <div className="text-sm font-bold text-white">{fmtNum(totalSpend/1000)}k</div>
                      </div>
                  </div>
                  <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Google Ads</div>
                          <div className="font-bold text-white">{fmtCurrency(currentData["ADS - Google Toplam Reklam Harcaması"])}</div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Meta Ads</div>
                          <div className="font-bold text-white">{fmtCurrency(currentData["ADS - Meta Toplam Reklam Harcaması"])}</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export const AdsView = ({ currentData, trendData, prevData, PageHeaderProps }: any) => {
  
  const ChannelCard = ({ name, color, spend, cpc, roas, conv, trend }: any) => (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-full hover:border-slate-600 transition-colors group">
        <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
            <div className="flex items-center gap-3 font-bold text-white text-lg">
                <div className="w-4 h-4 rounded-full shadow-lg shadow-indigo-500/20" style={{backgroundColor: color}}></div> 
                {name}
            </div>
            <div className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-bold text-slate-300 border border-slate-600">
                KANAL KARNESİ
            </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-8 flex-1">
             <div>
                 <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Harcama</div>
                 <div className="text-2xl font-bold text-white">{fmtCurrency(spend)}</div>
             </div>
             <div>
                 <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">ROAS (Getiri)</div>
                 <div className="text-2xl font-bold" style={{color}}>{roas?.toFixed(2)}x</div>
             </div>
             <div>
                 <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Tık. Başı Maliyet</div>
                 <div className="text-xl font-bold text-slate-200">{fmtCurrency(cpc)}</div>
             </div>
             <div>
                 <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Dönüşüm (Adet)</div>
                 <div className="text-xl font-bold text-slate-200">{fmtNum(conv)}</div>
             </div>
        </div>
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 flex justify-between items-center">
             <span className="text-slate-400 text-sm">Dönüşüm Oranı</span>
             <span className="font-bold text-white text-lg">%{currentData[`ADS - ${name.split(' ')[0]} Dönüşüm Oranı`]}</span>
        </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
       <PageHeader {...PageHeaderProps} title="Reklam Performansı" sub="Google Ads vs Meta Ads Detaylı Kırılım ve Analiz" />
       
       {/* 1. ÜST ÖZET */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <EnhancedKPICard title="Toplam Bütçe" val={currentData["ADS - TOP Toplam Reklam Harcaması"]} prev={prevData["ADS - TOP Toplam Reklam Harcaması"]} type="currency" trendData={trendData} dataKey="ADS - TOP Toplam Reklam Harcaması" color="#f97316" />
          <EnhancedKPICard title="Genel ROAS" val={currentData["ADS - TOP Reklam Harcama Getirisi (ROAS)"]} prev={prevData["ADS - TOP Reklam Harcama Getirisi (ROAS)"]} type="number" trendData={trendData} dataKey="ADS - TOP Reklam Harcama Getirisi (ROAS)" color="#10b981" />
          <EnhancedKPICard title="Toplam Dönüşüm" val={currentData["ADS - TOP Dönüşüm Sayısı"]} prev={prevData["ADS - TOP Dönüşüm Sayısı"]} type="number" trendData={trendData} dataKey="ADS - TOP Dönüşüm Sayısı" color="#3b82f6" />
          <EnhancedKPICard title="Ort. Tık. Maliyeti" val={currentData["ADS - TOP Tıklama Başına Maliyet (CPC)"]} prev={prevData["ADS - TOP Tıklama Başına Maliyet (CPC)"]} type="currency" trendData={trendData} dataKey="ADS - TOP Tıklama Başına Maliyet (CPC)" color="#a855f7" />
       </div>

       {/* 2. KANAL KARNELERİ (YAN YANA) */}
       <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-4"><Target className="text-indigo-500"/> Platform Bazlı Detaylar</h3>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChannelCard 
                name="Google Ads" 
                color="#3b82f6" 
                spend={currentData["ADS - Google Toplam Reklam Harcaması"]}
                cpc={currentData["ADS - Google Tıklama Başına Maliyet (CPC)"]}
                roas={currentData["ADS - Google Reklam Harcama Getirisi (ROAS)"]}
                conv={currentData["ADS - Google Dönüşüm Sayısı"]}
            />
            <ChannelCard 
                name="Meta Ads" 
                color="#a855f7" 
                spend={currentData["ADS - Meta Toplam Reklam Harcaması"]}
                cpc={currentData["ADS - Meta Tıklama Başına Maliyet (CPC)"]}
                roas={currentData["ADS - Meta Reklam Harcama Getirisi (ROAS)"]}
                conv={currentData["ADS - Meta Dönüşüm Sayısı"]}
            />
       </div>

       {/* 3. DETAYLI KARŞILAŞTIRMA GRAFİKLERİ */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
            {/* Harcama Payı */}
            <DetailCard title="Bütçe Payı Karşılaştırması">
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={trendData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                             <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                             <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `${val/1000}k`}/>
                             <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} formatter={(val:any) => fmtCurrency(val)}/>
                             <Legend verticalAlign="top" height={36}/>
                             <Bar dataKey="ADS - Google Toplam Reklam Harcaması" name="Google Bütçe" stackId="a" fill="#3b82f6" radius={[0,0,4,4]} />
                             <Bar dataKey="ADS - Meta Toplam Reklam Harcaması" name="Meta Bütçe" stackId="a" fill="#a855f7" radius={[4,4,0,0]} />
                         </BarChart>
                    </ResponsiveContainer>
                </div>
            </DetailCard>

            {/* ROAS Savaşı */}
            <DetailCard title="ROAS (Verimlilik) Savaşı" className="lg:col-span-2">
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 'auto']}/>
                            <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                            <Legend verticalAlign="top" height={36}/>
                            <Line type="monotone" dataKey="ADS - Google Reklam Harcama Getirisi (ROAS)" name="Google ROAS" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            <Line type="monotone" dataKey="ADS - Meta Reklam Harcama Getirisi (ROAS)" name="Meta ROAS" stroke="#a855f7" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            <Line type="monotone" dataKey="ADS - TOP Reklam Harcama Getirisi (ROAS)" name="Genel Ort." stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </DetailCard>
       </div>
    </div>
  );
};

export const SocialView = ({ currentData, trendData, prevData, PageHeaderProps }: any) => {
  
  const SocialPlatformCard = ({ name, icon: Icon, color, followers, growth, engagement }: any) => (
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 font-bold text-white text-lg">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 group-hover:border-slate-600 transition-colors" style={{color}}><Icon size={22}/></div>
                  {name}
              </div>
              <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 text-emerald-400 border border-slate-700 flex items-center gap-1">
                <TrendingUp size={12}/> +{fmtNum(growth)}
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Takipçi</div>
                  <div className="text-xl font-bold text-white">{fmtNum(followers)}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Etkileşim</div>
                  <div className="text-xl font-bold text-slate-200">{fmtNum(engagement)}</div>
              </div>
          </div>
          <div className="mt-4">
               <div className="flex justify-between text-xs text-slate-400 mb-1">
                   <span>Etkileşim Oranı</span>
                   <span>%{(engagement/followers*100).toFixed(1)}</span>
               </div>
               <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width: `${Math.min((engagement/followers)*500, 100)}%`, backgroundColor: color}}></div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
       <PageHeader {...PageHeaderProps} title="Sosyal Medya" sub="Platform Bazlı Topluluk, Büyüme ve Etkileşim Detayları" />
       
       {/* 1. GENEL ÖZET */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EnhancedKPICard title="Toplam Takipçi" val={currentData["SM - TOP Takipçi Sayısı"]} prev={prevData["SM - TOP Takipçi Sayısı"]} type="number" trendData={trendData} dataKey="SM - TOP Takipçi Sayısı" color="#ec4899" />
          <EnhancedKPICard title="Aylık Yeni Takipçi" val={currentData["SM - TOP Yeni Takipçi Sayısı"]} prev={prevData["SM - TOP Yeni Takipçi Sayısı"]} type="number" trendData={trendData} dataKey="SM - TOP Yeni Takipçi Sayısı" color="#8b5cf6" />
          <EnhancedKPICard title="Toplam Etkileşim" val={currentData["SM - TOP Gönderi Beğeni Sayısı"]} prev={prevData["SM - TOP Gönderi Beğeni Sayısı"]} type="number" trendData={trendData} dataKey="SM - TOP Gönderi Beğeni Sayısı" color="#f43f5e" />
       </div>

       {/* 2. PLATFORM KARTLARI (GRID) */}
       <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-4"><Share2 size={20} className="text-indigo-500"/> Platform Performansları</h3>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SocialPlatformCard 
                name="Instagram" icon={Instagram} color="#ec4899" 
                followers={currentData["SM - İNS Takipçi Sayısı"]}
                growth={currentData["SM - İNS Yeni Takipçi Sayısı"]}
                engagement={currentData["SM - İNS Gönderi Beğeni Sayısı"]}
            />
            <SocialPlatformCard 
                name="Facebook" icon={Facebook} color="#3b82f6" 
                followers={currentData["SM - FB Takipçi Sayısı"]}
                growth={currentData["SM - FB Yeni Takipçi Sayısı"]}
                engagement={currentData["SM - FB Gönderi Beğeni Sayısı"]}
            />
            <SocialPlatformCard 
                name="LinkedIn" icon={Linkedin} color="#0ea5e9" 
                followers={currentData["SM - LNK Takipçi Sayısı"]}
                growth={currentData["SM - LNK Yeni Takipçi Sayısı"]}
                engagement={currentData["SM - LNK Gönderi Beğeni Sayısı"]}
            />
            <SocialPlatformCard 
                name="X (Twitter)" icon={Twitter} color="#10b981" 
                followers={currentData["SM - X Takipçi Sayısı"]}
                growth={currentData["SM - X Yeni Takipçi Sayısı"]}
                engagement={currentData["SM - X Gönderi Beğeni Sayısı"]}
            />
       </div>

       {/* 3. KARŞILAŞTIRMALI GRAFİKLER */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <DetailCard title="Büyüme Yarışı (Takipçi Trendi)">
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                          <YAxis stroke="#94a3b8" fontSize={12} width={40}/>
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                          <Legend verticalAlign="top"/>
                          <Line type="monotone" dataKey="SM - İNS Takipçi Sayısı" name="Instagram" stroke="#ec4899" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="SM - FB Takipçi Sayısı" name="Facebook" stroke="#3b82f6" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="SM - LNK Takipçi Sayısı" name="LinkedIn" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </DetailCard>

          <DetailCard title="Etkileşim Pastası">
              <div className="h-80 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie 
                            data={[
                                { name: 'Instagram', value: currentData["SM - İNS Gönderi Beğeni Sayısı"] || 0, fill: '#ec4899' }, 
                                { name: 'Facebook', value: currentData["SM - FB Gönderi Beğeni Sayısı"] || 0, fill: '#3b82f6' },
                                { name: 'LinkedIn', value: currentData["SM - LNK Gönderi Beğeni Sayısı"] || 0, fill: '#0ea5e9' },
                                { name: 'X', value: currentData["SM - X Gönderi Beğeni Sayısı"] || 0, fill: '#10b981' }
                            ]} 
                            cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value"
                          >
                              <Cell fill="#ec4899" /><Cell fill="#3b82f6" /><Cell fill="#0ea5e9" /><Cell fill="#10b981" />
                          </Pie>
                          <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                          <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute pointer-events-none text-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">Toplam</div>
                      <div className="text-xl font-bold text-white">{fmtNum(currentData["SM - TOP Gönderi Beğeni Sayısı"])}</div>
                  </div>
              </div>
          </DetailCard>
       </div>
    </div>
  );
};

export const WebView = ({ currentData, trendData, prevData, PageHeaderProps }: any) => {
  
  // Dönüşüm hunisi görselleştirmesi için
  const InteractiveFunnel = ({ data }: { data: any }) => {
      const s1 = data["WEB-1.AŞAMAYA GEÇENLER"] || 0;
      const s2 = data["WEB-2.AŞAMAYA GEÇENLER"] || 0;
      const s3 = data["WEB-3.AŞAMAYA GEÇENLER"] || 0;
      const s4 = data["WEB-4.AŞAMAYA GEÇENLER"] || 0;
      
      // Conversion Rates
      const rate1to2 = s1 > 0 ? Math.round((s2/s1)*100) : 0;
      const rate2to3 = s2 > 0 ? Math.round((s3/s2)*100) : 0;
      const rate3to4 = s3 > 0 ? Math.round((s4/s3)*100) : 0;
  
      return (
          <div className="w-full bg-slate-950 rounded-3xl border border-slate-800 p-8 relative overflow-hidden mt-8 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none"></div>
              <h3 className="text-2xl font-bold text-white mb-8 relative z-10 flex items-center gap-3">
                  <Filter className="text-indigo-500" /> Müşteri Yolculuğu (Dönüşüm Hunisi)
              </h3>
              
              <div className="relative w-full max-w-5xl mx-auto aspect-[16/10] md:aspect-[16/8]">
                  <svg viewBox="0 0 1000 600" className="w-full h-full drop-shadow-2xl">
                      <defs>
                          <filter id="glow-red"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          <filter id="glow-amber"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          <filter id="glow-cyan"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          <filter id="glow-green"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                          
                          <linearGradient id="grad-red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ef4444" stopOpacity="0.4"/><stop offset="1" stopColor="#ef4444" stopOpacity="0.1"/></linearGradient>
                          <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f59e0b" stopOpacity="0.4"/><stop offset="1" stopColor="#f59e0b" stopOpacity="0.1"/></linearGradient>
                          <linearGradient id="grad-cyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06b6d4" stopOpacity="0.4"/><stop offset="1" stopColor="#06b6d4" stopOpacity="0.1"/></linearGradient>
                          <linearGradient id="grad-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#22c55e" stopOpacity="0.4"/><stop offset="1" stopColor="#22c55e" stopOpacity="0.1"/></linearGradient>
                      </defs>
  
                      {/* --- STAGE 1: FARKINDALIK --- */}
                      <g>
                           <path d="M 100 50 L 900 50 L 800 180 L 200 180 Z" fill="url(#grad-red)" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.3" />
                           <text x="500" y="100" textAnchor="middle" className="text-2xl font-bold fill-white" style={{textShadow: '0 0 10px #ef4444'}}>ZİYARET (TRAFİK)</text>
                           <text x="500" y="130" textAnchor="middle" className="text-xl font-bold fill-red-200">{fmtNum(s1)} Kişi</text>
                           <text x="850" y="120" className="text-sm fill-red-400 font-bold">Kayıp: {fmtNum(s1-s2)}</text>
                      </g>
  
                      {/* --- STAGE 2: İLGİ --- */}
                      <g>
                           <path d="M 200 180 L 800 180 L 700 310 L 300 310 Z" fill="url(#grad-amber)" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" />
                           <text x="500" y="230" textAnchor="middle" className="text-2xl font-bold fill-white" style={{textShadow: '0 0 10px #f59e0b'}}>ÜRÜN İNCELEME</text>
                           <text x="500" y="260" textAnchor="middle" className="text-xl font-bold fill-amber-200">{fmtNum(s2)} Kişi</text>
                           <text x="500" y="195" textAnchor="middle" className="text-sm fill-white font-bold bg-black">▼ %{rate1to2} Geçiş</text>
                      </g>
  
                      {/* --- STAGE 3: KARAR --- */}
                      <g>
                           <path d="M 300 310 L 700 310 L 600 440 L 400 440 Z" fill="url(#grad-cyan)" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.3" />
                           <text x="500" y="360" textAnchor="middle" className="text-2xl font-bold fill-white" style={{textShadow: '0 0 10px #06b6d4'}}>SEPETE EKLEME</text>
                           <text x="500" y="390" textAnchor="middle" className="text-xl font-bold fill-cyan-200">{fmtNum(s3)} Kişi</text>
                           <text x="500" y="325" textAnchor="middle" className="text-sm fill-white font-bold">▼ %{rate2to3} Geçiş</text>
                      </g>
  
                      {/* --- STAGE 4: EYLEM --- */}
                      <g>
                           <path d="M 400 440 L 600 440 L 550 550 L 450 550 Z" fill="url(#grad-green)" stroke="#22c55e" strokeWidth="1" strokeOpacity="0.3" />
                           <text x="500" y="490" textAnchor="middle" className="text-2xl font-bold fill-white" style={{textShadow: '0 0 10px #22c55e'}}>SATIN ALMA</text>
                           <text x="500" y="520" textAnchor="middle" className="text-3xl font-bold fill-emerald-300">{fmtNum(s4)} Satış</text>
                           <text x="500" y="455" textAnchor="middle" className="text-sm fill-white font-bold">▼ %{rate3to4} Geçiş</text>
                      </g>
                  </svg>
              </div>
          </div>
      );
  }

  const FunnelRow = ({ step, label, value, drop, color }: any) => (
      <div className="grid grid-cols-12 gap-4 items-center py-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors px-4 rounded-lg">
          <div className="col-span-4 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-${color}-500/20 ring-2 ring-${color}-500/20`} style={{backgroundColor: color}}>{step}</div>
              <div className="font-bold text-slate-200">{label}</div>
          </div>
          <div className="col-span-3 text-right font-mono text-xl text-white">{fmtNum(value)}</div>
          <div className="col-span-5">
              {drop > 0 && (
                  <div className="flex items-center gap-2 text-xs text-rose-400 justify-end bg-rose-500/10 py-1 px-3 rounded-full w-fit ml-auto border border-rose-500/20">
                      <TrendingDown size={14}/> {fmtNum(drop)} Kayıp
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
       <PageHeader {...PageHeaderProps} title="Web & Huni Analizi" sub="Ziyaretçiden Müşteriye Dönüşüm Yolculuğu ve Kayıp Analizi" />
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EnhancedKPICard title="Toplam Trafik" val={currentData["WEB-Toplam Trafik Sayısı"]} prev={prevData["WEB-Toplam Trafik Sayısı"]} type="number" trendData={trendData} dataKey="WEB-Toplam Trafik Sayısı" color="#3b82f6" />
            <EnhancedKPICard title="Satış Dönüşüm" val={currentData["WEB-Satış Dönüşüm Oranı (%)"]} prev={prevData["WEB-Satış Dönüşüm Oranı (%)"]} type="percent" trendData={trendData} dataKey="WEB-Satış Dönüşüm Oranı (%)" color="#10b981" />
            <EnhancedKPICard title="Sepet Terk" val={currentData["WEB-Sepet Terk Oranı (%)"]} prev={prevData["WEB-Sepet Terk Oranı (%)"]} type="percent" trendData={trendData} dataKey="WEB-Sepet Terk Oranı (%)" color="#f43f5e" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOL: Tablo Görünümü */}
          <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Filter size={20} className="text-orange-400"/> Adım Adım Kayıp Analizi Tablosu</h3>
               <div className="bg-slate-900/50 rounded-xl border border-slate-800">
                   <FunnelRow step="1" label="Farkındalık (Ziyaret)" value={currentData["WEB-1.AŞAMAYA GEÇENLER"]} drop={currentData["WEB-1.AŞAMADA AYRILANLAR"]} color="#ef4444" />
                   <FunnelRow step="2" label="İlgi (Ürün İnceleme)" value={currentData["WEB-2.AŞAMAYA GEÇENLER"]} drop={currentData["WEB-2.AŞAMADA AYRILANLAR"]} color="#f59e0b" />
                   <FunnelRow step="3" label="Karar (Sepet)" value={currentData["WEB-3.AŞAMAYA GEÇENLER"]} drop={currentData["WEB-3.AŞAMADA AYRILANLAR"]} color="#06b6d4" />
                   <FunnelRow step="4" label="Eylem (Satın Alma)" value={currentData["WEB-4.AŞAMAYA GEÇENLER"]} drop={0} color="#22c55e" />
               </div>
          </div>

          {/* SAĞ: Özet Metrikler */}
          <div className="space-y-6">
              <DetailCard title="Trafik Kaynak Kalitesi">
                   <div className="space-y-6">
                       <div>
                           <div className="flex justify-between items-center mb-1">
                               <div className="text-xs text-slate-500 font-bold uppercase">Hemen Çıkma (Bounce)</div>
                               <div className="text-lg font-bold text-rose-400">%{currentData["WEB-Hemen Çıkma Oranı"]}</div>
                           </div>
                           <div className="w-full bg-slate-700 h-2 rounded-full"><div className="h-full bg-rose-500 rounded-full" style={{width: `${currentData["WEB-Hemen Çıkma Oranı"]}%`}}></div></div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                           <div>
                               <div className="text-xs text-slate-500 mb-1">Pop-up Etkileşim</div>
                               <div className="text-xl font-bold text-white">{fmtNum(currentData["WEB-Pop Up Tıklama"])}</div>
                           </div>
                           <div>
                               <div className="text-xs text-slate-500 mb-1">Form Doldurma</div>
                               <div className="text-xl font-bold text-white">{fmtNum(currentData["WEB-Form Dolduran (Adet)"])}</div>
                           </div>
                       </div>
                   </div>
              </DetailCard>
              
              <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl">
                  <h4 className="text-indigo-300 font-bold text-sm uppercase mb-2 flex items-center gap-2"><MousePointerClick size={16}/> Eylem Çağrısı</h4>
                  <p className="text-sm text-indigo-200 mb-4">Sepet terk oranı yüksek. Retargeting (Yeniden Pazarlama) reklamlarını artırmayı düşünün.</p>
                  <div className="text-3xl font-bold text-white">%{currentData["WEB-Sepet Terk Oranı (%)"]}</div>
                  <div className="text-xs text-indigo-400 mt-1">Terk Oranı</div>
              </div>
          </div>
       </div>

       {/* ALT: Görsel Huni */}
       <InteractiveFunnel data={currentData} />
    </div>
  );
};

export const SalesView = ({ currentData, trendData, prevData, PageHeaderProps }: any) => (
  <div className="space-y-8 animate-fade-in pb-20">
     <PageHeader {...PageHeaderProps} title="Satış & Finans" sub="Karlılık, Marjlar ve Birim Ekonomi Analizi" />
     
     {/* 1. ÜST ÖZET */}
     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EnhancedKPICard title="Toplam Ciro" val={currentData["SAL - Toplam Tutar Ciro"]} prev={prevData["SAL - Toplam Tutar Ciro"]} type="currency" trendData={trendData} dataKey="SAL - Toplam Tutar Ciro" color="#10b981" />
        <EnhancedKPICard title="Net Kar" val={currentData["SAL - Toplam Net Kar"]} prev={prevData["SAL - Toplam Net Kar"]} type="currency" trendData={trendData} dataKey="SAL - Toplam Net Kar" color="#3b82f6" />
        <EnhancedKPICard title="Satış Adedi" val={currentData["SAL - Toplam Satılan Ürün Adet"]} prev={prevData["SAL - Toplam Satılan Ürün Adet"]} type="number" trendData={trendData} dataKey="SAL - Toplam Satılan Ürün Adet" color="#f59e0b" />
        <EnhancedKPICard title="Ort. Sepet (AOV)" val={currentData["SAL - Ortalama Sepet-Müşteri Değeri Tutarı"]} prev={prevData["SAL - Ortalama Sepet-Müşteri Değeri Tutarı"]} type="currency" trendData={trendData} dataKey="SAL - Ortalama Sepet-Müşteri Değeri Tutarı" color="#8b5cf6" />
     </div>

     {/* 2. DETAYLI KAR ANALİZİ */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><DollarSign size={20} className="text-emerald-400"/> Gelir vs Gider vs Kar Trendi</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorProfitFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" tickFormatter={(val) => `₺${val/1000}k`} fontSize={12}/>
                        <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} formatter={(val: any) => fmtCurrency(val)} />
                        <Legend verticalAlign="top" height={36}/>
                        <Area type="monotone" dataKey="SAL - Toplam Tutar Ciro" name="Ciro" stroke="#10b981" fill="transparent" strokeWidth={2} />
                        <Area type="monotone" dataKey="ADS - TOP Toplam Reklam Harcaması" name="Reklam Gideri" stroke="#f43f5e" fill="transparent" strokeWidth={2} />
                        <Area type="monotone" dataKey="SAL - Toplam Net Kar" name="Net Kar" stroke="#3b82f6" fill="url(#colorProfitFill)" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Marj Kartı & Unit Economics */}
        <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-transparent pointer-events-none"></div>
                 <h3 className="text-lg font-bold text-white mb-8 relative z-10">Operasyonel Marj Analizi</h3>
                 <div className="space-y-6 relative z-10">
                     <div>
                         <div className="flex justify-between text-sm text-slate-300 mb-1">Net Kar Marjı</div>
                         <div className="text-4xl font-bold text-white">
                             %{currentData["SAL - Toplam Tutar Ciro"] > 0 ? ((currentData["SAL - Toplam Net Kar"] / currentData["SAL - Toplam Tutar Ciro"]) * 100).toFixed(1) : 0}
                         </div>
                     </div>
                     <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-xs text-slate-400">Reklam Maliyeti Oranı</span>
                             <span className="font-bold text-orange-400">
                                 %{currentData["SAL - Toplam Tutar Ciro"] > 0 ? ((currentData["ADS - TOP Toplam Reklam Harcaması"] / currentData["SAL - Toplam Tutar Ciro"]) * 100).toFixed(1) : 0}
                             </span>
                         </div>
                         <div className="w-full bg-slate-700 h-1.5 rounded-full"><div className="h-full bg-orange-500 rounded-full" style={{width: `${((currentData["ADS - TOP Toplam Reklam Harcaması"] / currentData["SAL - Toplam Tutar Ciro"]) * 100)}%`}}></div></div>
                     </div>
                 </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">İade Analizi</h3>
                <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-white">% {currentData["SAL - Ürün İade Oranı"] || 0}</div>
                    <div className="text-xs text-slate-500 mb-1">İade Oranı</div>
                </div>
            </div>
        </div>
     </div>
  </div>
);

// --- KPI KARTLARI & YEREL GÖRÜNÜRLÜK ---

export const KPIAnalysisCardsView = ({ currentData, prevData, trendData, PageHeaderProps }: any) => {
    const getMetricType = (metricName: string) => {
        const lower = metricName.toLowerCase();
        if (lower.includes("ciro") || lower.includes("harcama") || lower.includes("tutar") || lower.includes("maliyet") || lower.includes("fiyat") || lower.includes("bütçe")) return "currency";
        if (lower.includes("oran") || lower.includes("roas") || lower.includes("yüzde") || lower.includes("ctr")) return "percent";
        return "number";
    };

    const getCategoryColor = (categoryName: string) => {
        switch(categoryName) {
            case "REKLAM ANALİZİ": return "#3b82f6"; 
            case "SATIŞ ANALİZİ": return "#10b981"; 
            case "SOSYAL MEDYA ANALİZ": return "#ec4899"; 
            case "SEO ANALİZİ": return "#f59e0b"; 
            case "WEB SİTE-HUNİ ANALİZİ": return "#8b5cf6"; 
            default: return "#64748b";
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <PageHeader {...PageHeaderProps} title="KPI Analiz Kartları" sub="Tüm Metriklerin Detaylı Kart Görünümü" />
            {Object.entries(KPI_STRUCTURE).map(([category, subCategories]) => (
                <div key={category} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                        <div className="p-2 rounded-lg bg-slate-800" style={{color: getCategoryColor(category)}}><LayoutGrid size={24}/></div>
                        <h3 className="text-2xl font-bold text-white">{category}</h3>
                    </div>
                    {Object.entries(subCategories).map(([subCat, metrics]: any) => (
                        <div key={subCat} className="pl-4 border-l-2 border-slate-800">
                            <h4 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-600"></span> {subCat}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {metrics.map((metric: string) => (
                                    <EnhancedKPICard key={metric} title={metric.split('- ').pop()} val={currentData[metric]} prev={prevData[metric]} trendData={trendData} dataKey={metric} type={getMetricType(metric)} color={getCategoryColor(category)} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export const LocalVisibilityView = ({ currentData, trendData, prevData, PageHeaderProps }: any) => {
    const answeredReviews = currentData["GBP- GBP Cevaplanan Yorum Sayısı"] || 0;
    const totalReviews = currentData["GBP- GBP Yorum sayısı"] || 0;
    const responseRate = totalReviews > 0 ? (answeredReviews / totalReviews) * 100 : 100;
    
    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <PageHeader {...PageHeaderProps} title="Yerel Görünürlük" sub="Google İşletme Profili (GBP) ve İtibar Yönetimi" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <EnhancedKPICard title="Toplam Yorum" val={currentData["GBP- GBP Yorum sayısı"]} prev={prevData["GBP- GBP Yorum sayısı"]} type="number" trendData={trendData} dataKey="GBP- GBP Yorum sayısı" color="#f59e0b" />
                <EnhancedKPICard title="Ortalama Puan" val={currentData["GBP- GBP Puanı"]} prev={prevData["GBP- GBP Puanı"]} type="number" trendData={trendData} dataKey="GBP- GBP Puanı" color="#fbbf24" />
                <EnhancedKPICard title="Gelen Sorular" val={currentData["GBP- GBP Soru Sayısı"]} prev={prevData["GBP- GBP Soru Sayısı"]} type="number" trendData={trendData} dataKey="GBP- GBP Soru Sayısı" color="#6366f1" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="text-emerald-400" size={20}/> Yorum Cevaplama Performansı</h3>
                        <div className="text-xs font-bold px-3 py-1 bg-slate-700 rounded-full text-slate-300">Cevaplama Oranı: <span className={`${responseRate >= 90 ? 'text-emerald-400' : 'text-yellow-400'}`}>%{responseRate.toFixed(0)}</span></div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                                <Legend />
                                <Bar dataKey="GBP- GBP Yorum sayısı" name="Toplam Yorum" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="GBP- GBP Cevaplanan Yorum Sayısı" name="Cevaplanan" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Star className="text-yellow-400" size={20}/> Puan ve Soru Trendi</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#fbbf24" domain={[0, 5]} />
                                <YAxis yAxisId="right" orientation="right" stroke="#6366f1" />
                                <Tooltip contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff'}} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="GBP- GBP Puanı" name="Ort. Puan" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="GBP- GBP Soru Sayısı" name="Gelen Soru" stroke="#6366f1" strokeWidth={2} dot={true} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3-TAB COMPANY EDITOR ---
const CompanyEditor = ({ company, onClose, onSave, onDelete, appData }: any) => {
    const [activeTab, setActiveTab] = useState(0);
    const [data, setData] = useState({...company, socialLinks: company.socialLinks || {}, kpiConfig: company.kpiConfig || { "Google Ads": true, "Meta Ads": true, "Instagram": true, "Facebook": true, "LinkedIn": true, "X (Twitter)": true, "GBP (Google Business)": true, "SEO": true, "Web Analiz": true }});
    const handleChange = (field: string, value: any) => setData((prev: any) => ({...prev, [field]: value}));
    const handleNestedChange = (parent: string, field: string, value: any) => setData((prev: any) => ({...prev, [parent]: {...prev[parent], [field]: value}}));
    const toggleKPI = (key: string) => { const currentConfig = data.kpiConfig || {}; handleChange('kpiConfig', {...currentConfig, [key]: !currentConfig[key]}); };
    const toggleOptions = [{ key: "Google Ads", label: "Google Ads", cat: "Reklam" }, { key: "Meta Ads", label: "Meta (Fb/Insta) Ads", cat: "Reklam" }, { key: "Instagram", label: "Instagram Organik", cat: "Sosyal Medya" }, { key: "Facebook", label: "Facebook Organik", cat: "Sosyal Medya" }, { key: "LinkedIn", label: "LinkedIn", cat: "Sosyal Medya" }, { key: "X (Twitter)", label: "X (Twitter)", cat: "Sosyal Medya" }, { key: "GBP (Google Business)", label: "Google İşletme Profili", cat: "Sosyal Medya" }, { key: "SEO", label: "SEO (Arama Motoru)", cat: "SEO" }, { key: "Web Analiz", label: "Web Sitesi Trafik & Huni", cat: "Web" }];
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-4xl h-[90vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900"><div><h2 className="text-2xl font-bold text-white flex items-center gap-3"><Building2 className="text-indigo-500"/> {data.name}</h2><p className="text-slate-400 text-sm">Firma Kartı ve Yapılandırma</p></div><button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={24}/></button></div>
                <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto"><button onClick={() => setActiveTab(0)} className={`flex-1 py-4 px-4 text-sm font-bold ${activeTab === 0 ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>Künye & İletişim</button><button onClick={() => setActiveTab(1)} className={`flex-1 py-4 px-4 text-sm font-bold ${activeTab === 1 ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>Ajans & Sözleşme</button><button onClick={() => setActiveTab(2)} className={`flex-1 py-4 px-4 text-sm font-bold ${activeTab === 2 ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>KPI Seçim Ekranı</button><button onClick={() => setActiveTab(3)} className={`flex-1 py-4 px-4 text-sm font-bold ${activeTab === 3 ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5' : 'text-slate-500 hover:text-slate-300'}`}>Başlangıç Analizi</button></div>
                <div className="flex-1 overflow-y-auto p-8 bg-slate-900">
                    {activeTab === 0 && <div className="space-y-4"><h3 className="text-indigo-400 font-bold text-sm uppercase">Genel Bilgiler</h3><input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" value={data.name} onChange={(e) => handleChange('name', e.target.value)} /><input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" value={data.industry} onChange={(e) => handleChange('industry', e.target.value)} /><button onClick={() => onDelete(data.id)} className="bg-rose-900/20 border border-rose-900/50 text-rose-400 px-4 py-3 rounded-xl text-sm font-bold w-full flex items-center justify-center gap-2 mt-8"><Trash2 size={16}/> Firmayı Sil</button></div>}
                    {activeTab === 1 && <div className="space-y-4"><h3 className="text-indigo-400 font-bold text-sm uppercase">Sözleşme</h3><input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none" value={data.servicePackage} onChange={(e) => handleChange('servicePackage', e.target.value)} placeholder="Paket Adı" /></div>}
                    {activeTab === 2 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{toggleOptions.map(opt => (<div key={opt.key} onClick={() => toggleKPI(opt.key)} className={`cursor-pointer p-4 rounded-xl border flex items-center justify-between ${data.kpiConfig[opt.key] !== false ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-800 border-slate-700 opacity-50'}`}>{opt.label} {data.kpiConfig[opt.key] !== false ? <Check size={20} className="text-indigo-400"/> : <X size={20} className="text-slate-500"/>}</div>))}</div>}
                    {activeTab === 3 && <textarea className="w-full h-full bg-slate-800 border border-slate-700 rounded-xl p-6 text-slate-200 outline-none resize-none" value={data.initialAnalysis || ''} onChange={(e) => handleChange('initialAnalysis', e.target.value)} placeholder="Başlangıç analizi..." />}
                </div>
                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4"><button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-400 font-bold">İptal</button><button onClick={() => onSave(data)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/20">Kaydet</button></div>
            </div>
        </div>
    );
};

export const AgencyHomeView = ({ appData, getCurrentData, setSelectedCompanyId, setActivePage, PageHeaderProps, handleClearData }: any) => (
  <div className="space-y-6 animate-fade-in pb-20">
    <PageHeader {...PageHeaderProps} title="Ajans Kokpiti" sub="Tüm Müşterilerin Anlık Durumu" />
    
    {/* DEMO MODE WARNING BANNER */}
    <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-300"><Info size={24}/></div>
            <div>
                <h3 className="text-lg font-bold text-white mb-1">Demo Modundasınız</h3>
                <p className="text-indigo-200 text-sm max-w-2xl">
                    Şu anda gördüğünüz veriler (Ciro: ₺313.950, Aktif Müşteri: 1 vb.) sistemin özelliklerini inceleyebilmeniz için <strong>rastgele oluşturulmuş örnek verilerdir</strong>. 
                    Bu veriler sizin ajansınıza ait değildir. Kendi gerçek verilerinizi girmek için sistemi temizleyebilirsiniz.
                </p>
            </div>
        </div>
        <button 
            onClick={handleClearData}
            className="whitespace-nowrap bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all"
        >
            <Trash2 size={18}/> Tüm Demo Verileri Temizle
        </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div title="Panelde ekli olan ve durumu 'Active' veya 'Growth' olan toplam müşteri sayınız." className="bg-slate-800 p-4 rounded-xl border border-slate-700 group hover:border-slate-600 transition-colors relative cursor-help">
            <div className="flex justify-between items-start mb-2">
                <div className="text-slate-400 text-xs font-bold uppercase">Aktif Müşteri</div>
                <HelpCircle size={14} className="text-slate-600 group-hover:text-slate-400"/>
            </div>
            <div className="text-2xl font-bold text-white">{appData.companies.filter((c: any) => c.status === 'Active' || c.status === 'Growth').length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Ajansın yönettiği toplam aktif firma sayısı.</div>
        </div>

        <div title="Yönettiğiniz tüm müşterilerin bu ayki toplam cirolarının toplamı. Ajansınızın yönettiği ekonomik büyüklüğü gösterir." className="bg-slate-800 p-4 rounded-xl border border-slate-700 group hover:border-slate-600 transition-colors relative cursor-help">
            <div className="flex justify-between items-start mb-2">
                <div className="text-slate-400 text-xs font-bold uppercase">Yönetilen Ciro</div>
                <HelpCircle size={14} className="text-slate-600 group-hover:text-emerald-500"/>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{fmtCurrency(appData.companies.reduce((acc: number, c: any) => acc + (getCurrentData(c.id)["SAL - Toplam Tutar Ciro"] || 0), 0))}</div>
            <div className="text-[10px] text-slate-500 mt-1">Tüm müşterlerin toplam cirosu.</div>
        </div>

        <div title="Durumu 'Critical' (Riskli) olarak işaretlenmiş, ilgi bekleyen müşteri sayısı." className="bg-slate-800 p-4 rounded-xl border border-slate-700 group hover:border-slate-600 transition-colors relative cursor-help">
            <div className="flex justify-between items-start mb-2">
                <div className="text-slate-400 text-xs font-bold uppercase">Riskli Müşteri</div>
                <HelpCircle size={14} className="text-slate-600 group-hover:text-rose-500"/>
            </div>
            <div className="text-2xl font-bold text-red-400">{appData.companies.filter((c: any) => c.status === 'Critical').length}</div>
            <div className="text-[10px] text-slate-500 mt-1">Kayıp riski taşıyan müşteri sayısı.</div>
        </div>

        <div title="Tüm müşterilerinizin Google ve Meta reklamlarına harcadığı toplam bütçe." className="bg-slate-800 p-4 rounded-xl border border-slate-700 group hover:border-slate-600 transition-colors relative cursor-help">
            <div className="flex justify-between items-start mb-2">
                <div className="text-slate-400 text-xs font-bold uppercase">Yönetilen Reklam</div>
                <HelpCircle size={14} className="text-slate-600 group-hover:text-blue-500"/>
            </div>
            <div className="text-2xl font-bold text-blue-400">{fmtCurrency(appData.companies.reduce((acc: number, c: any) => { const d = getCurrentData(c.id); return acc + (d["ADS - TOP Toplam Reklam Harcaması"] || 0); }, 0))}</div>
            <div className="text-[10px] text-slate-500 mt-1">Tüm müşterlerin toplam reklam harcaması.</div>
        </div>
    </div>

    <div className="bg-indigo-900/10 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-lg">
        <h4 className="text-indigo-300 font-bold text-sm mb-1 flex items-center gap-2"><Info size={16}/> Bilgi: Ajans Kokpiti Nedir?</h4>
        <p className="text-xs text-slate-400">
            Yukarıdaki kartlar, sisteme eklediğiniz <strong>tüm müşterilerin verilerinin toplamını</strong> gösterir. Örneğin; A firmasının cirosu 100 TL, B firmasının cirosu 200 TL ise "Yönetilen Ciro" 300 TL görünür. Bu veriler, ajansınızın toplamda ne kadarlık bir operasyonu yönettiğini size gösterir.
        </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appData.companies.map((comp: any) => {
          const data = getCurrentData(comp.id);
          const roas = data["ADS - TOP Reklam Harcama Getirisi (ROAS)"] || 0;
          const isPassive = comp.status === 'Passive';
          return (
            <div key={comp.id} onClick={() => {setSelectedCompanyId(comp.id); setActivePage('dashboard')}} className={`bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl p-6 cursor-pointer transition-all group relative overflow-hidden ${isPassive ? 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100' : 'hover:border-indigo-500'}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${comp.status === 'Growth' ? 'bg-emerald-500' : (comp.status === 'Critical' ? 'bg-red-500' : (comp.status === 'Passive' ? 'bg-slate-500' : 'bg-yellow-500'))}`}></div>
              <div className="flex justify-between items-start mb-4 pl-2"><div><h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{comp.name}</h4><span className="text-xs text-slate-500">{comp.industry}</span></div><span className={`px-2 py-1 rounded text-xs font-bold ${comp.status === 'Growth' ? 'bg-emerald-500/20 text-emerald-400' : (comp.status === 'Critical' ? 'bg-red-500/20 text-red-400' : (comp.status === 'Passive' ? 'bg-slate-500/20 text-slate-400' : 'bg-yellow-500/20 text-yellow-400'))}`}>{comp.status}</span></div>
              <div className="grid grid-cols-2 gap-4 mb-4 pl-2"><div><div className="text-xs text-slate-400">Ciro</div><div className="text-white font-bold">{fmtCurrency(data["SAL - Toplam Tutar Ciro"])}</div></div><div><div className="text-xs text-slate-400">Ort. ROAS</div><div className="text-white font-bold">{roas.toFixed(2)}x</div></div></div>
            </div>
          )
        })}
        {appData.companies.length === 0 && (
            <div className="col-span-3 py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
                <Building2 size={48} className="mb-4 opacity-50"/>
                <p className="text-lg font-bold">Henüz Müşteri Eklenmemiş</p>
                <p className="text-sm mb-4">"Firmalar" menüsünden yeni müşteri ekleyerek başlayın.</p>
                <button onClick={() => setActivePage('companies')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Yeni Ekle</button>
            </div>
        )}
    </div>
  </div>
);

export const CompaniesView = ({ appData, PageHeaderProps, setAppData, user }: any) => {
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const addCompany = async () => {
    const newId = Date.now();
    const newCompany = { id: newId, name: "Yeni Müşteri", industry: "Sektör Belirtilmemiş", status: "Active", manager: "Sen", kpiConfig: { "Google Ads": true, "Meta Ads": true, "Instagram": true, "Facebook": true, "LinkedIn": true, "X (Twitter)": true, "GBP (Google Business)": true, "SEO": true, "Web Analiz": true }};
    const updatedCompanies = [...appData.companies, newCompany];
    setAppData((prev: any) => ({...prev, companies: updatedCompanies}));
    if(user && db) await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'companies'), { list: updatedCompanies });
    setEditingCompany(newCompany);
  };
  const handleSaveCompany = (updatedComp: any) => {
      const newList = appData.companies.map((c: any) => c.id === updatedComp.id ? updatedComp : c);
      setAppData((prev: any) => ({...prev, companies: newList}));
      setEditingCompany(null);
  };
  const handleDeleteCompany = async (id: number) => {
      const newList = appData.companies.filter((c: any) => c.id !== id);
      const newDb = { ...appData.db }; delete newDb[id];
      setAppData({ companies: newList, db: newDb } as any);
      setEditingCompany(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
       <PageHeader {...PageHeaderProps} title="Firma Yönetimi" sub="Müşteri Portföyü ve Yapılandırma" />
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appData.companies.map((comp: any) => (
              <div key={comp.id} className={`bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden transition-all group relative ${comp.status === 'Passive' ? 'opacity-60 grayscale' : 'hover:border-indigo-500/50'}`}>
                  <div className="p-6">
                      <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white bg-indigo-600 shadow-lg">{comp.name.substring(0,2).toUpperCase()}</div><div className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-700 text-slate-400">{comp.status}</div></div>
                      <h3 className="text-xl font-bold text-white mb-1">{comp.name}</h3>
                      <div className="flex gap-3 mt-6"><button onClick={() => {PageHeaderProps.setSelectedCompanyId(comp.id); PageHeaderProps.setActivePage('dashboard')}} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold">Paneli Aç</button><button onClick={() => setEditingCompany(comp)} className="w-12 bg-slate-700 text-slate-300 rounded-xl flex items-center justify-center"><Edit2 size={18}/></button></div>
                  </div>
              </div>
          ))}
          <button onClick={addCompany} className="bg-slate-800/50 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-white min-h-[300px]"><Plus size={32}/><span className="font-bold text-lg">Yeni Firma Ekle</span></button>
       </div>
       {editingCompany && <CompanyEditor company={editingCompany} onClose={() => setEditingCompany(null)} onSave={handleSaveCompany} onDelete={handleDeleteCompany} appData={appData} />}
    </div>
  )
};

export const BackupView = ({ PageHeaderProps, appData, setAppData, hasUnsavedChanges, setHasUnsavedChanges }: any) => {
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr); 
    downloadAnchorNode.setAttribute("download", `metriq360_backup.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click(); 
    downloadAnchorNode.remove();
    
    // Mark changes as saved
    if (setHasUnsavedChanges) setHasUnsavedChanges(false);
  };
  
  const importData = (event: any) => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e: any) => { 
        try { 
            const json = JSON.parse(e.target.result); 
            setAppData(json); 
            if (setHasUnsavedChanges) setHasUnsavedChanges(false);
            alert("Yedek yüklendi!"); 
        } catch (error) { alert("Hata oluştu."); } 
    };
    reader.readAsText(file);
  };
  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <PageHeader {...PageHeaderProps} title="Veri & Yedekleme" sub="Excel Import/Export" />
      
      {hasUnsavedChanges && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3 mb-6 animate-fade-in">
              <AlertTriangle className="text-rose-500 shrink-0" size={24} />
              <div>
                  <h3 className="font-bold text-rose-400">Kaydedilmemiş Veriler Var!</h3>
                  <p className="text-sm text-rose-200/80 mt-1">
                      Yaptığınız son değişiklikler sadece tarayıcı hafızasında. Tarayıcı önbelleğini temizlerseniz veya farklı bir cihazdan girerseniz bu verileri göremezsiniz. 
                      Lütfen verilerinizi indirin.
                  </p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
            {hasUnsavedChanges && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse"></div>}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${hasUnsavedChanges ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                <Download size={40}/>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Yedekle (İndir)</h3>
            <p className="text-slate-400 text-sm mb-4">Verilerinizi bilgisayarınıza JSON dosyası olarak indirin.</p>
            <button onClick={exportData} className={`w-full text-white py-4 rounded-xl font-bold mt-4 transition-all ${hasUnsavedChanges ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                {hasUnsavedChanges ? 'Şimdi Yedekle & Kaydet' : 'İndir'}
            </button>
          </div>

          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-6"><Upload size={40}/></div>
            <h3 className="text-2xl font-bold text-white mb-2">Geri Yükle</h3>
            <p className="text-slate-400 text-sm mb-4">Daha önce indirdiğiniz bir yedeği yükleyin.</p>
            <label className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold mt-4 cursor-pointer transition-colors">
                Dosya Seç
                <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
      </div>
    </div>
  );
};

export const SettingsView = ({ PageHeaderProps }: any) => (
  <div className="space-y-6 animate-fade-in pb-20">
     <PageHeader {...PageHeaderProps} title="Ayarlar" sub="Sistem Yapılandırması" />
     <div className="max-w-2xl space-y-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700"><h3 className="text-white font-bold mb-4">Sistem</h3><button onClick={() => {localStorage.clear(); window.location.reload()}} className="text-rose-400 font-bold border border-rose-900/50 bg-rose-900/10 px-4 py-2 rounded-lg">Verileri Sıfırla</button></div>
     </div>
  </div>
);
