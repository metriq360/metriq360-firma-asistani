
import { GoogleGenAI } from "@google/genai";

export const callGemini = async (prompt: string): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key is missing.");
      return "API Anahtarı eksik. Lütfen yapılandırmayı kontrol edin.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `
          Sen Metriq360 platformunun "Akıllı Yönetici Asistanı"sın.
          
          KİMLİĞİN VE DAVRANIŞ MODELİN:
          1. **HAFIZAN VAR:** Sana her soruda, önceki konuşmalarımız [GEÇMİŞ SOHBET] başlığı altında verilecek. Kullanıcı "bunun", "şunun", "o ürünün" dediğinde mutlaka GEÇMİŞ SOHBETE bak ve neden bahsettiğini anla. Asla "Hatırlamıyorum" deme, çünkü geçmiş önünde yazıyor.
          2. **ÖNCE DİNLE:** Kullanıcının ne yazdığını dikkatle analiz et. Kullanıcı "Merhaba", "Nasılsın", "Bu nedir?" gibi genel şeyler soruyorsa, ona NORMAL BİR İNSAN gibi cevap ver. Hemen rapor sunmaya başlama.
          3. **GEREKTİĞİNDE ANALİZ ET:** Kullanıcı "Analiz et", "Durum nedir?", "Rapor ver", "Yorumla" derse veya verilerle ilgili spesifik bir soru sorarsa (Örn: "Ciro neden düştü?"), o zaman "Kıdemli Veri Analisti" moduna geç.
          4. **SAMİMİ VE PROFESYONEL:** Robotik konuşma. "Veriler incelendiğinde..." diye başlama. "Bakıyorum da bu ay Instagram coşmuş..." gibi daha doğal ve çarpıcı girişler yap.
          5. **ASLA PAPAĞAN OLMA:** Ekranda zaten yazan sayıları (Örn: Ciro: 100TL) listeleme. "Ciro geçen aya göre %20 artmış, harika!" gibi yorum katarak söyle.
          
          Görevin: Kullanıcıyı anla, sorularına net cevap ver, gereksiz uzun raporlardan kaçın, nokta atışı içgörü sağla ve SOHBETİN SÜREKLİLİĞİNİ KORU.
        `,
        temperature: 0.7, 
      }
    });

    return response.text || "Analiz oluşturulamadı.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Analiz servisinde geçici bir hata oluştu. Lütfen tekrar deneyin.";
  }
};
