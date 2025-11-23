
import { AppData, ProductSale } from './types.ts';

export const KPI_STRUCTURE: Record<string, Record<string, string[]>> = {
  "REKLAM ANALİZİ": {
    "Google Ads": ["ADS - Google Toplam Reklam Harcaması", "ADS - Google Gösterim Sayısı", "ADS - Google Reklam Tıklama Sayısı", "ADS - Google Dönüşüm Sayısı", "ADS - Google Dönüşüm Değeri (Ciro)", "ADS - Google Tıklama Başına Maliyet (CPC)", "ADS - Google Dönüşüm Oranı", "ADS - Google Reklam Harcama Getirisi (ROAS)"],
    "Meta Ads": ["ADS - Meta Toplam Reklam Harcaması", "ADS - Meta Gösterim Sayısı", "ADS - Meta Reklam Tıklama Sayısı", "ADS - Meta Dönüşüm Sayısı", "ADS - Meta Dönüşüm Değeri (Ciro)", "ADS - Meta Tıklama Başına Maliyet (CPC)", "ADS - Meta Dönüşüm Oranı", "ADS - Meta Reklam Harcama Getirisi (ROAS)"],
    "TOP (Toplam) Performans": ["ADS - TOP Toplam Reklam Harcaması", "ADS - TOP Gösterim Sayısı", "ADS - TOP Reklam Tıklama Sayısı", "ADS - TOP Dönüşüm Sayısı", "ADS - TOP Tıklama Başına Maliyet (CPC)", "ADS - TOP Dönüşüm Oranı", "ADS - TOP Reklam Harcama Getirisi (ROAS)"]
  },
  "SATIŞ ANALİZİ": {
    "Finansal": ["SAL - Toplam Tutar Ciro", "SAL - Toplam Net Kar", "SAL - Toplam Satılan Ürün Adet", "SAL - Toplam Müşteri Sayısı", "SAL - Ürün İade Oranı", "SAL - Ortalama Satış Tutarı", "SAL - Ortalama Sepet-Müşteri Değeri Tutarı"]
  },
  "SOSYAL MEDYA ANALİZ": {
    "Instagram": ["SM - İNS Takipçi Sayısı", "SM - İNS Yeni Takipçi Sayısı", "SM - İNS Gönderi Beğeni Sayısı", "SM - İNS Gönderi Yorum Sayısı", "SM - İNS Sayfa Ziyaretçi Sayısı"],
    "Facebook": ["SM - FB Takipçi Sayısı", "SM - FB Yeni Takipçi Sayısı", "SM - FB Gönderi Beğeni Sayısı", "SM - FB Gönderi Yorum Sayısı", "SM - FB Sayfa Ziyaretçi Sayısı"],
    "LinkedIn": ["SM - LNK Takipçi Sayısı", "SM - LNK Yeni Takipçi Sayısı", "SM - LNK Gönderi Beğeni Sayısı", "SM - LNK Gönderi Yorum Sayısı", "SM - LNK Sayfa Ziyaretçi Sayısı"],
    "X (Twitter)": ["SM - X Takipçi Sayısı", "SM - X Yeni Takipçi Sayısı", "SM - X Gönderi Beğeni Sayısı", "SM - X Gönderi Yorum Sayısı", "SM - X Sayfa Ziyaretçi Sayısı"],
    "TOP (Sosyal)": ["SM - TOP Takipçi Sayısı", "SM - TOP Yeni Takipçi Sayısı", "SM - TOP Gönderi Beğeni Sayısı", "SM - TOP Gönderi Yorum Sayısı", "SM - TOP Sayfa Ziyaretçi Sayısı"],
    "GBP (Google Business)": ["GBP- GBP Yorum sayısı", "GBP- GBP Cevaplanan Yorum Sayısı", "GBP- GBP Soru Sayısı", "GBP- GBP Cevaplanan Soru Sayısı", "GBP- GBP Puanı"]
  },
  "SEO ANALİZİ": {
    "Trafik & Sıralama": ["SEO-Toplam Organik Trafik", "SEO-Yeni Ziyaretçi Sayısı", "SEO-Mobil Ziyaretçi Oranı", "SEO-Site Hızı", "SEO-Arama Motoru Sıralamaları", "SEO-Organik Tıklama Oranı (CTR)"]
  },
  "WEB SİTE-HUNİ ANALİZİ": {
    "Trafik Kaynakları": ["WEB-Toplam Trafik Sayısı", "WEB-Reklamın Trafik Dönüşüm Sayısı", "WEB-Reklam Trafik Harcama Bütçesi", "WEB-Reklam Gösterim Sayısı", "WEB-Hemen Çıkma Oranı"],
    "1. Aşama (Farkındalık)": ["WEB-1.AŞAMAYA GEÇENLER", "WEB-1.AŞAMADA AYRILANLAR", "WEB-Sayfaları Gezen(blog-ürün-iletişim)", "WEB-Pop Up Tıklama"],
    "2. Aşama (İlgi)": ["WEB-2.AŞAMAYA GEÇENLER", "WEB-2.AŞAMADA AYRILANLAR", "WEB-E Posta Kaydı", "WEB-İletişim Başlatma (Adet)", "WEB-Alaka Dönüşüm Oranı (%)"],
    "3. Aşama (Değerlendirme)": ["WEB-3.AŞAMAYA GEÇENLER", "WEB-3.AŞAMADA AYRILANLAR", "WEB-Sepet Ekleme Sayısı (Adet)", "WEB-Fiyat İnceleme (Adet)", "WEB-Satın Alma Teklifi Tıklama (Adet)", "WEB-Değer Dönüşüm Oranı (%)"],
    "4. Aşama (Dönüşüm)": ["WEB-4.AŞAMAYA GEÇENLER", "WEB-Satış İşlemi", "WEB-Form Dolduran (Adet)", "WEB-Randevu Onaylama (Adet)", "WEB-Sepet Terk Oranı (%)", "WEB-Satış Dönüşüm Oranı (%)"]
  }
};

export const CALCULATED_FIELDS = [
  // Ads Calculations
  "ADS - Google Tıklama Başına Maliyet (CPC)", "ADS - Google Dönüşüm Oranı", "ADS - Google Reklam Harcama Getirisi (ROAS)",
  "ADS - Meta Tıklama Başına Maliyet (CPC)", "ADS - Meta Dönüşüm Oranı", "ADS - Meta Reklam Harcama Getirisi (ROAS)",
  "ADS - TOP Toplam Reklam Harcaması", "ADS - TOP Gösterim Sayısı", "ADS - TOP Reklam Tıklama Sayısı", "ADS - TOP Dönüşüm Sayısı", "ADS - TOP Tıklama Başına Maliyet (CPC)", "ADS - TOP Dönüşüm Oranı", "ADS - TOP Reklam Harcama Getirisi (ROAS)",
  
  // Sales Calculations
  "SAL - Ortalama Satış Tutarı", "SAL - Ortalama Sepet-Müşteri Değeri Tutarı",
  
  // Social Calculations
  "SM - TOP Takipçi Sayısı", "SM - TOP Yeni Takipçi Sayısı", "SM - TOP Gönderi Beğeni Sayısı", "SM - TOP Gönderi Yorum Sayısı", "SM - TOP Sayfa Ziyaretçi Sayısı",
  
  // Web Funnel Calculations
  "WEB-Reklam Trafik Harcama Bütçesi", "WEB-Reklamın Trafik Dönüşüm Sayısı", "WEB-Reklam Gösterim Sayısı",
  
  // OTOMATİK HESAPLANACAK AYRILANLAR (Fark Hesabı):
  "WEB-1.AŞAMADA AYRILANLAR", "WEB-2.AŞAMADA AYRILANLAR", "WEB-3.AŞAMADA AYRILANLAR",
  
  // ORANLAR:
  "WEB-Alaka Dönüşüm Oranı (%)", "WEB-Değer Dönüşüm Oranı (%)", "WEB-Satış Dönüşüm Oranı (%)", "WEB-Sepet Terk Oranı (%)"
];

export const fmtCurrency = (num: number | undefined) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(num || 0);
export const fmtNum = (num: number | undefined) => new Intl.NumberFormat('tr-TR').format(Math.round(num || 0));
export const fmtPercent = (num: number | undefined) => `%${(num || 0).toFixed(1)}`;
export const getDateKey = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

export const generateSampleData = (): AppData => {
  const companies = [
    { 
        id: 1, 
        name: "Örnek Kobi A.Ş.", 
        industry: "Perakende", 
        status: "Active", 
        manager: "Sen", 
        notes: "Yerel butik işletmesi.",
        // Tab 1 Data
        taxId: "1234567890",
        foundingDate: "2018-05-15",
        address: "İlkadım mah. Barış Bul. No:2 Samsun",
        authorizedPerson: "Ali Veli",
        email: "ali.veli@ornekkobi.com",
        phone: "0532 123 45 67",
        socialLinks: {
            website: "www.ornekkobi.com",
            instagram: "@ornekkobi",
        },
        // Tab 2 Data
        agencyStartDate: "2024-01-01",
        contractDetails: "1 Yıllık Growth Paket, Aylık Yenileme",
        servicePackage: "IQ360 GROWTH",
        paymentNotes: "Her ayın 1'inde fatura kesilir. Ödeme 22.000 TL + KDV",
        servicesProvided: ["Google Ads", "Meta Ads", "Sosyal Medya", "SEO"],
        toolsUsed: ["Google Analytics 4", "Semrush"],
        // Tab 3 Config (Default all enabled for sample)
        kpiConfig: {
            "Google Ads": true, "Meta Ads": true, "Instagram": true, "Facebook": true, "LinkedIn": true, "X (Twitter)": true, "GBP (Google Business)": true, "SEO": true, "Web Analiz": true
        },
        // Tab 4 Initial Analysis
        initialAnalysis: "Firma devralındığında web sitesi trafiği günlük ortalama 50 kişiydi. Google Ads hesabı kurulum aşamasındaydı ancak conversion tracking (dönüşüm takibi) yapılmıyordu. \n\nSosyal medya hesaplarında düzenli paylaşım yoktu, etkileşim oranı %0.5 seviyesindeydi. \n\nHedef: İlk 6 ayda ciroyu %200 artırmak ve ROAS'ı 4.0 seviyesine getirmek."
    }
  ];

  const productsRef = [
    { id: "101", name: "Kışlık Kaban", defPrice: 1200, defCost: 600 },
    { id: "102", name: "Kot Pantolon", defPrice: 600, defCost: 250 },
    { id: "103", name: "Triko Kazak", defPrice: 450, defCost: 180 },
    { id: "104", name: "Aksesuar Seti", defPrice: 150, defCost: 40 }
  ];

  const years = [2024, 2025];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const db: Record<number, Record<string, any>> = {};

  db[1] = {};

  let base_ig_followers = 3200;
  let base_fb_followers = 1500;
  let base_lnk_followers = 150;
  let base_x_followers = 80;
  let base_gbp_reviews = 45;
  const base_gbp_score = 4.5;

  years.forEach(year => {
    months.forEach(month => {
      const dateKey = `${year}-${String(month).padStart(2, '0')}`;
      let seasonalFactor = 1.0;
      if (month === 11) seasonalFactor = 1.6; 
      if (month === 12) seasonalFactor = 1.4; 
      if (month >= 6 && month <= 8) seasonalFactor = 1.1; 
      const growthFactor = year === 2025 ? 1.15 : 1.0;
      const noise = () => 0.95 + Math.random() * 0.10;

      // Product Sales Generation
      const product_sales: ProductSale[] = productsRef.map(p => {
          let vol = 0;
          if(p.name === "Kışlık Kaban") vol = (month >= 10 || month <= 2) ? Math.round(50 * seasonalFactor * noise()) : Math.round(5 * noise());
          else if(p.name === "Kot Pantolon") vol = Math.round(120 * seasonalFactor * growthFactor * noise());
          else if(p.name === "Triko Kazak") vol = (month >= 9 || month <= 4) ? Math.round(80 * seasonalFactor * noise()) : Math.round(20 * noise());
          else vol = Math.round(200 * growthFactor * noise()); // Aksesuar
          
          return {
              id: p.id,
              name: p.name,
              qty: vol,
              price: p.defPrice,
              cost: p.defCost
          };
      });

      const total_rev = product_sales.reduce((acc, p) => acc + (p.qty * p.price), 0);
      const total_cogs = product_sales.reduce((acc, p) => acc + (p.qty * p.cost), 0);
      const total_sales_count = product_sales.reduce((acc, p) => acc + p.qty, 0);

      // Marketing Logic linked loosely to sales
      const g_spend = (total_rev * 0.15) * noise();
      const g_cpc = 3.5 * noise();
      const g_click = g_spend / g_cpc;
      const g_conv_rate = 0.045 * noise();
      const g_conv = g_click * g_conv_rate;
      const g_rev = total_rev * 0.6; // Assuming 60% sales come from Google
      const g_roas = g_rev / g_spend;

      const m_spend = (total_rev * 0.10) * noise();
      const m_cpc = 2.1 * noise();
      const m_click = m_spend / m_cpc;
      const m_conv_rate = 0.038 * noise();
      const m_conv = m_click * m_conv_rate;
      const m_rev = total_rev * 0.4; // Assuming 40% sales come from Meta
      const m_roas = m_rev / m_spend;

      const total_marketing_spend = g_spend + m_spend;
      const total_ad_traffic = g_click + m_click;
      const total_ad_conv = g_conv + m_conv;

      const ops_cost = 25000; 
      const net_profit = total_rev - total_cogs - ops_cost - total_marketing_spend;
      const refund_rate = 3.5 + (Math.random()); 

      const new_ig = Math.round(80 * seasonalFactor * noise());
      const new_fb = Math.round(20 * seasonalFactor * noise());
      const new_lnk = Math.round(5 * noise());
      const new_x = Math.round(3 * noise());

      base_ig_followers += new_ig;
      base_fb_followers += new_fb;
      base_lnk_followers += new_lnk;
      base_x_followers += new_x;
      
      if(Math.random() > 0.6) base_gbp_reviews += 1;

      const web_total_traffic = Math.round(total_ad_traffic * 1.4);
      const web_bounce_rate = 45 + (Math.random() * 5);
      
      const funnel_1_awareness = web_total_traffic;
      const funnel_2_interest = Math.round(web_total_traffic * (1 - (web_bounce_rate/100))); 
      const funnel_3_eval = Math.round(funnel_2_interest * 0.4); 
      const funnel_4_purchase = Math.round(total_sales_count); 

      db[1][dateKey] = {
        "product_sales": product_sales, // NEW DATA FIELD

        "ADS - Google Toplam Reklam Harcaması": parseFloat(g_spend.toFixed(2)),
        "ADS - Google Gösterim Sayısı": Math.round(g_click * 15),
        "ADS - Google Reklam Tıklama Sayısı": Math.round(g_click),
        "ADS - Google Dönüşüm Sayısı": Math.round(g_conv),
        "ADS - Google Dönüşüm Değeri (Ciro)": parseFloat(g_rev.toFixed(2)),
        "ADS - Google Tıklama Başına Maliyet (CPC)": parseFloat(g_cpc.toFixed(2)),
        "ADS - Google Dönüşüm Oranı": parseFloat((g_conv_rate * 100).toFixed(2)),
        "ADS - Google Reklam Harcama Getirisi (ROAS)": parseFloat(g_roas.toFixed(2)),

        "ADS - Meta Toplam Reklam Harcaması": parseFloat(m_spend.toFixed(2)),
        "ADS - Meta Gösterim Sayısı": Math.round(m_click * 25),
        "ADS - Meta Reklam Tıklama Sayısı": Math.round(m_click),
        "ADS - Meta Dönüşüm Sayısı": Math.round(m_conv),
        "ADS - Meta Dönüşüm Değeri (Ciro)": parseFloat(m_rev.toFixed(2)),
        "ADS - Meta Tıklama Başına Maliyet (CPC)": parseFloat(m_cpc.toFixed(2)),
        "ADS - Meta Dönüşüm Oranı": parseFloat((m_conv_rate * 100).toFixed(2)),
        "ADS - Meta Reklam Harcama Getirisi (ROAS)": parseFloat(m_roas.toFixed(2)),

        "ADS - TOP Toplam Reklam Harcaması": parseFloat(total_marketing_spend.toFixed(2)),
        "ADS - TOP Gösterim Sayısı": Math.round((g_click * 15) + (m_click * 25)),
        "ADS - TOP Reklam Tıklama Sayısı": Math.round(total_ad_traffic),
        "ADS - TOP Dönüşüm Sayısı": Math.round(total_ad_conv),
        "ADS - TOP Tıklama Başına Maliyet (CPC)": parseFloat((total_marketing_spend / total_ad_traffic).toFixed(2)),
        "ADS - TOP Dönüşüm Oranı": parseFloat(((total_ad_conv / total_ad_traffic) * 100).toFixed(2)),
        "ADS - TOP Reklam Harcama Getirisi (ROAS)": parseFloat(((g_rev + m_rev) / total_marketing_spend).toFixed(2)),

        "SAL - Toplam Tutar Ciro": parseFloat(total_rev.toFixed(2)),
        "SAL - Toplam Net Kar": parseFloat(net_profit.toFixed(2)),
        "SAL - Toplam Satılan Ürün Adet": total_sales_count,
        "SAL - Toplam Müşteri Sayısı": Math.round(total_sales_count * 0.92),
        "SAL - Ürün İade Oranı": parseFloat(refund_rate.toFixed(2)),
        "SAL - Ortalama Satış Tutarı": parseFloat((total_rev / total_sales_count).toFixed(2)),
        "SAL - Ortalama Sepet-Müşteri Değeri Tutarı": parseFloat((total_rev / (total_sales_count * 0.92)).toFixed(2)),

        "SM - İNS Takipçi Sayısı": base_ig_followers,
        "SM - İNS Yeni Takipçi Sayısı": new_ig,
        "SM - İNS Gönderi Beğeni Sayısı": Math.round(new_ig * 3.5),
        "SM - İNS Gönderi Yorum Sayısı": Math.round(new_ig * 0.2),
        "SM - İNS Sayfa Ziyaretçi Sayısı": Math.round(base_ig_followers * 0.15),

        "SM - FB Takipçi Sayısı": base_fb_followers,
        "SM - FB Yeni Takipçi Sayısı": new_fb,
        "SM - FB Gönderi Beğeni Sayısı": Math.round(new_fb * 2.5),
        "SM - FB Gönderi Yorum Sayısı": Math.round(new_fb * 0.1),
        "SM - FB Sayfa Ziyaretçi Sayısı": Math.round(base_fb_followers * 0.05),

        "SM - LNK Takipçi Sayısı": base_lnk_followers,
        "SM - LNK Yeni Takipçi Sayısı": new_lnk,
        "SM - LNK Gönderi Beğeni Sayısı": Math.round(new_lnk * 1.5),
        "SM - LNK Gönderi Yorum Sayısı": Math.round(new_lnk * 0.1),
        "SM - LNK Sayfa Ziyaretçi Sayısı": Math.round(base_lnk_followers * 0.08),

        "SM - X Takipçi Sayısı": base_x_followers,
        "SM - X Yeni Takipçi Sayısı": new_x,
        "SM - X Gönderi Beğeni Sayısı": Math.round(new_x * 1.2),
        "SM - X Gönderi Yorum Sayısı": Math.round(new_x * 0.05),
        "SM - X Sayfa Ziyaretçi Sayısı": Math.round(base_x_followers * 0.02),

        "SM - TOP Takipçi Sayısı": base_ig_followers + base_fb_followers + base_lnk_followers + base_x_followers,
        "SM - TOP Yeni Takipçi Sayısı": new_ig + new_fb + new_lnk + new_x,
        "SM - TOP Gönderi Beğeni Sayısı": Math.round((new_ig * 3.5) + (new_fb * 2.5) + (new_lnk * 1.5) + (new_x * 1.2)),
        "SM - TOP Gönderi Yorum Sayısı": Math.round((new_ig * 0.2) + (new_fb * 0.1) + (new_lnk * 0.1) + (new_x * 0.05)),
        "SM - TOP Sayfa Ziyaretçi Sayısı": Math.round((base_ig_followers * 0.15) + (base_fb_followers * 0.05) + (base_lnk_followers * 0.08) + (base_x_followers * 0.02)),
        "GBP- GBP Yorum sayısı": base_gbp_reviews,
        "GBP- GBP Cevaplanan Yorum Sayısı": Math.round(base_gbp_reviews * 0.9),
        "GBP- GBP Soru Sayısı": Math.round(base_gbp_reviews * 0.2),
        "GBP- GBP Cevaplanan Soru Sayısı": Math.round(base_gbp_reviews * 0.18),
        "GBP- GBP Puanı": base_gbp_score,

        "SEO-Toplam Organik Trafik": Math.round(web_total_traffic * 0.35),
        "SEO-Yeni Ziyaretçi Sayısı": Math.round(web_total_traffic * 0.25),
        "SEO-Mobil Ziyaretçi Oranı": 78.4,
        "SEO-Site Hızı": 85,
        "SEO-Arama Motoru Sıralamaları": 14.2, 
        "SEO-Organik Tıklama Oranı (CTR)": 3.2,

        "WEB-Toplam Trafik Sayısı": web_total_traffic,
        "WEB-Reklamın Trafik Dönüşüm Sayısı": Math.round(total_ad_conv),
        "WEB-Reklam Trafik Harcama Bütçesi": parseFloat(total_marketing_spend.toFixed(2)),
        "WEB-Reklam Gösterim Sayısı": Math.round((g_click * 15) + (m_click * 25)),
        "WEB-Hemen Çıkma Oranı": parseFloat(web_bounce_rate.toFixed(1)),
        
        "WEB-1.AŞAMAYA GEÇENLER": funnel_1_awareness,
        "WEB-1.AŞAMADA AYRILANLAR": Math.round(funnel_1_awareness * (web_bounce_rate/100)),
        "WEB-Sayfaları Gezen(blog-ürün-iletişim)": Math.round(funnel_1_awareness * 0.6),
        "WEB-Pop Up Tıklama": Math.round(funnel_1_awareness * 0.05),

        "WEB-2.AŞAMAYA GEÇENLER": funnel_2_interest,
        "WEB-2.AŞAMADA AYRILANLAR": Math.round(funnel_2_interest * 0.4),
        "WEB-E Posta Kaydı": Math.round(funnel_2_interest * 0.08),
        "WEB-İletişim Başlatma (Adet)": Math.round(funnel_2_interest * 0.03), 
        "WEB-Alaka Dönüşüm Oranı (%)": parseFloat(((funnel_2_interest / funnel_1_awareness) * 100).toFixed(2)),

        "WEB-3.AŞAMAYA GEÇENLER": funnel_3_eval,
        "WEB-3.AŞAMADA AYRILANLAR": Math.round(funnel_3_eval * 0.6),
        "WEB-Sepet Ekleme Sayısı (Adet)": Math.round(funnel_3_eval * 0.8),
        "WEB-Fiyat İnceleme (Adet)": Math.round(funnel_3_eval * 0.9),
        "WEB-Satın Alma Teklifi Tıklama (Adet)": Math.round(funnel_3_eval * 0.1),
        "WEB-Değer Dönüşüm Oranı (%)": parseFloat(((funnel_3_eval / funnel_2_interest) * 100).toFixed(2)),

        "WEB-4.AŞAMAYA GEÇENLER": funnel_4_purchase,
        "WEB-Satış İşlemi": funnel_4_purchase,
        "WEB-Form Dolduran (Adet)": Math.round(funnel_4_purchase * 0.2),
        "WEB-Randevu Onaylama (Adet)": 0,
        "WEB-Sepet Terk Oranı (%)": parseFloat((((Math.round(funnel_3_eval * 0.8) - funnel_4_purchase) / Math.round(funnel_3_eval * 0.8)) * 100).toFixed(2)),
        "WEB-Satış Dönüşüm Oranı (%)": parseFloat(((funnel_4_purchase / funnel_1_awareness) * 100).toFixed(2))
      };
    });
  });

  const products = [
    { name: "Kışlık Kaban", price: 1200, cost: 600, volume: 45, profit: 600, type: "Sezonluk" },
    { name: "Kot Pantolon", price: 600, cost: 250, volume: 120, profit: 350, type: "Temel" },
    { name: "Triko Kazak", price: 450, cost: 180, volume: 85, profit: 270, type: "Sezonluk" },
    { name: "Aksesuar Seti", price: 150, cost: 40, volume: 200, profit: 110, type: "Çapraz Satış" }
  ];

  return { companies, db, products } as any;
};