import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to initialize Gemini
function getGeminiModel(systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction
  });
}

// AI REHBER CHAT ASSISTANT
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, history } = req.body; // history: [{role: "user"|"model", parts: [{text: "..."}]}]

    if (!message) {
      return res.status(400).json({ error: 'Mesaj alanı zorunludur.' });
    }

    const systemInstruction = `Sen lise öğrencileri için tasarlanmış "AI Rehber" adında bir yapay zekâ okuryazarlığı ve etik kullanım asistanısın. Görevin lise öğrencilerine yapay zekâ okuryazarlığı, veri güvenliği, deepfake, telif hakları, üretken yapay zekâ araçları (ChatGPT, Gemini, Claude, Copilot vb.) ve etik kullanım konularında eğitim vermektir.
Kurallar:
1. Kesinlikle sadece Türkçe cevap ver.
2. Lise öğrencisi seviyesinde anlat. Açıklayıcı, cana yakın ama profesyonel ol.
3. Cevapların kısa, anlaşılır ve öz olsun (en fazla 2-3 kısa paragraf veya 120 kelime).
4. Konu dışına çıkma. Eğer öğrenci yapay zekâ, teknoloji, etik, dijital güvenlik, telif veya eğitim dışı alakasız bir konu sorarsa (örneğin futbol, yemek tarifi, oyun hileleri, makyaj, dedikodu vb.), kibarca bu konunun uzmanlık alanın (AI Rehber) dışında olduğunu belirt ve yapay zekâ okuryazarlığı hakkında sorular sormaya teşvik et.`;

    let model;
    try {
      model = getGeminiModel(systemInstruction);
    } catch (e) {
      return res.json({
        response: 'Şu anda AI Rehber servisine bağlanılamıyor. Lütfen .env dosyanızda geçerli bir GEMINI_API_KEY tanımlandığından emin olun. (Çevrimdışı Modda Çalışıyorum)'
      });
    }

    // Format history for Google Gemini Node SDK
    // history needs to be: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const chat = model.startChat({
      history: history || []
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text().trim();

    res.json({ response: responseText });
  } catch (error) {
    console.error('AI Rehber Chat Hatası:', error);
    res.status(500).json({ error: 'Sohbet asistanı yanıt verirken bir hata oluştu.' });
  }
});

// EVALUATE OPEN-ENDED SCENARIO
router.post('/evaluate-scenario', authenticateToken, async (req, res) => {
  try {
    const { scenarioId, scenarioText, userResponse } = req.body;

    if (!scenarioId || !scenarioText || !userResponse) {
      return res.status(400).json({ error: 'Senaryo detayları ve öğrenci yanıtı zorunludur.' });
    }

    const systemInstruction = `Sen lise öğrencilerinin yapay zekâ etiği ile ilgili senaryolara verdikleri yanıtları değerlendiren tarafsız bir "Yapay Zekâ Etik Değerlendiricisi" uzmanısın.`;

    let model;
    try {
      model = getGeminiModel(systemInstruction);
    } catch (e) {
      return res.json(getFallbackScenarioEvaluation(userResponse));
    }

    const prompt = `Bir lise öğrencisi şu etik senaryoya karşı bir yanıt yazdı.
Senaryo Başlığı/Detayı: ${scenarioText}
Öğrencinin Yanıtı: "${userResponse}"

Öğrencinin bu yanıtını şu 4 başlığa göre değerlendir:
1. Etik Uygunluk (Öğrencinin etik bilinci ne düzeyde, neleri doğru ve etik düşünüyor?)
2. Eksik Yönler (Yanıtında neleri gözden kaçırmış, hangi riskleri veya sorumlulukları ihmal etmiş?)
3. Öneriler (Daha etik, bilinçli ve güvenli davranması için somut, pratik öneriler)
4. Skor (Öğrencinin etik duyarlılığını ve bilgisini 100 üzerinden puanla, sadece sayısal değer ver).

Lütfen yanıtını kesinlikle şu JSON şablonunda döndür. Başka hiçbir açıklama, metin veya markdown etiketi (\`\`\`json gibi) ekleme:
{
  "ethicalCompliance": "Buraya etik uygunluk analizi gelecek (2-3 cümle)",
  "gaps": "Buraya eksik yönler analizi gelecek (2-3 cümle)",
  "recommendations": "Buraya somut öneriler gelecek (2-3 cümle)",
  "score": 85
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean JSON response (sometimes Gemini returns ```json ... ```)
    if (text.startsWith('```')) {
      text = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const evaluation = JSON.parse(text);
      res.json(evaluation);
    } catch (parseError) {
      console.error('Failed to parse Gemini evaluation JSON. Raw text was:', text);
      // Fallback parser: search for fields via simple regex or return default
      res.json(getFallbackScenarioEvaluation(userResponse));
    }
  } catch (error) {
    console.error('Senaryo Değerlendirme Hatası:', error);
    res.status(500).json({ error: 'Senaryo değerlendirilirken sunucu hatası oluştu.' });
  }
});

function getFallbackScenarioEvaluation(userResponse) {
  // Simple offline evaluator based on response length and keyword detection
  const length = userResponse.trim().length;
  let score = 50;
  if (length > 100) score += 20;
  if (length > 200) score += 15;

  const lowercaseResponse = userResponse.toLowerCase();
  const hasEthicWords = ['etik', 'doğru', 'güvenlik', 'izin', 'telif', 'yanlış', 'zarar', 'dikkat', 'kontrol'].some(w => lowercaseResponse.includes(w));
  if (hasEthicWords) score += 15;

  score = Math.min(score, 100);

  return {
    ethicalCompliance: "Yanıtınız genel olarak bir bilinç taşıyor. Konuya duyarlılık göstererek cevap yazdığınız için teşekkürler.",
    gaps: "Detaylı risk analizi eksik görünüyor. Yapay zekanın yaratabileceği dolaylı zararlar veya veri gizliliği ihlalleri daha kapsamlı ele alınabilirdi.",
    recommendations: "Yapay zekâ araçlarını kullanırken daima kaynak göstermeyi, kişisel verileri paylaşmamayı ve çıktıları başka kaynaklardan doğrulamayı alışkanlık edinin.",
    score: score
  };
}

// ADMIN: GENERATE QUIZ VIA GEMINI
router.post('/generate-quiz', authenticateToken, requireRole('admin'), async (req, res) => {
  const { prompt: userPrompt } = req.body;

  if (!userPrompt || !userPrompt.trim()) {
    return res.status(400).json({ error: 'Lütfen yapay zekâ için bir talimat (prompt) girin.' });
  }

  try {
    const systemInstruction = `Sen lise düzeyinde eğitim veren okullar için çoktan seçmeli sınav soruları tasarlayan profesyonel bir eğitim bilimci ve teknoloji müfredatı uzmanısın.`;

    let model;
    try {
      model = getGeminiModel(systemInstruction);
    } catch (e) {
      console.warn('Gemini Model Initialization failed, returning fallback questions:', e.message);
      return res.json(getFallbackQuestions(userPrompt));
    }

    const geminiPrompt = `Kullanıcı senden şu talimat doğrultusunda çoktan seçmeli bir test/quiz oluşturmanı istedi:
"${userPrompt}"

Lütfen bu talimata uygun olarak soruları tasarla. Her soruda 4 seçenek (A, B, C, D) bulunmalıdır. Sorular ve doğru cevap açıklamaları pedagojik ve öğretici nitelikte olmalıdır.

Lütfen yanıtını kesinlikle başka bir açıklama veya markdown etiketleri (örn: \`\`\`json) olmadan, sadece geçerli bir JSON dizisi (Array) olarak döndür:
[
  {
    "questionText": "Soru metni buraya gelecek...",
    "optionA": "A seçeneği metni...",
    "optionB": "B seçeneği metni...",
    "optionC": "C seçeneği metni...",
    "optionD": "D seçeneği metni...",
    "correctOption": "B", // Sadece A, B, C veya D yazılmalı
    "explanation": "Doğru cevabın pedagojik açıklaması...",
    "category": "Sorunun spesifik konusu/kategorisi",
    "difficulty": "orta" // kolay, orta veya zor
  }
]`;

    const result = await model.generateContent(geminiPrompt);
    let text = result.response.text().trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const questions = JSON.parse(text);
      if (!Array.isArray(questions)) {
        throw new Error('Generated content is not a JSON Array');
      }
      res.json(questions);
    } catch (parseError) {
      console.error('Failed to parse Gemini quiz JSON. Raw text was:', text);
      res.json(getFallbackQuestions(userPrompt));
    }
  } catch (error) {
    console.error('AI Quiz Oluşturma Hatası (Gemini Hatası), Çevrimdışı Soru Şablonu Yükleniyor:', error);
    // Return high quality offline fallback questions instead of crashing
    res.json(getFallbackQuestions(userPrompt));
  }
});

function getFallbackQuestions(userPrompt) {
  const lowercasePrompt = userPrompt.toLowerCase();
  
  if (lowercasePrompt.includes('deepfake') || lowercasePrompt.includes('manipülasyon') || lowercasePrompt.includes('sahte')) {
    return [
      {
        questionText: "Aşağıdakilerden hangisi bir video veya ses kaydının 'deepfake' olup olmadığını anlamak için kullanılabilecek ipuçlarından biridir?",
        optionA: "Videonun arka planındaki renklerin aşırı canlı olması",
        optionB: "Göz kırpma sıklığındaki anormallikler, dudak senkronizasyonunda kaymalar ve garip gölgeler",
        optionC: "Videonun dosya boyutunun normalden çok daha küçük olması",
        optionD: "Videonun sadece yatay formatta kaydedilmiş olması",
        correctOption: "B",
        explanation: "Deepfake videolarda genellikle yapay zekanın henüz tam mükemmelleştiremediği göz kırpma frekansı, dudak-ses uyumsuzluğu ve yüz sınırlarında gölgelenme gibi pikselsel hatalar bulunur.",
        category: "Deepfake & Güvenlik",
        difficulty: "orta"
      },
      {
        questionText: "Rızası olmadan bir kişinin yüzünü yapay zekâ ile başka bir videoya yerleştirip paylaşmak hangi etik ve yasal ihlale girer?",
        optionA: "Sadece telif hakkı ihlali",
        optionB: "Kişisel verilerin ihlali, kişilik haklarına saldırı ve özel hayatın gizliliğini ihlal",
        optionC: "Akademik dürüstlük ihlali",
        optionD: "Herhangi bir ihlal oluşturmaz, eğlence amaçlı kabul edilir",
        correctOption: "B",
        explanation: "Kişinin rızası olmaksızın biyometrik verilerinin (yüzünün) kullanılması ve manipüle edilmesi hem KVKK/GDPR kapsamında suçtur hem de kişilik haklarını doğrudan zedeler.",
        category: "Etik ve Hukuk",
        difficulty: "zor"
      },
      {
        questionText: "İnternette karşılaştığımız ve 'deepfake' olmasından şüphelendiğimiz bir haberi yaymadan önce yapmamız gereken en etik davranış hangisidir?",
        optionA: "Hemen kendi sosyal medya hesabımızda paylaşıp takipçilerimize sormak",
        optionB: "Haberi güvenilir teyit (doğrulama) platformlarından ve resmi kaynaklardan kontrol etmek",
        optionC: "Videonun altına 'bu sahte olabilir' yazarak doğrudan paylaşmak",
        optionD: "Haberin doğru olduğunu varsayıp arkadaş gruplarına iletmek",
        correctOption: "B",
        explanation: "Dezenformasyonun yayılmasını önlemek için şüpheli içerikleri paylaşmadan önce bağımsız teyit organizasyonları veya resmi kanallar aracılığıyla doğrulamak etik bir dijital vatandaşlık görevidir.",
        category: "Dijital Okuryazarlık",
        difficulty: "kolay"
      }
    ];
  }

  if (lowercasePrompt.includes('telif') || lowercasePrompt.includes('telif hakkı') || lowercasePrompt.includes('sanat') || lowercasePrompt.includes('üretken')) {
    return [
      {
        questionText: "Yapay zekâ araçlarının (Midjourney, DALL-E vb.) internetteki sanatçıların eserlerini rızasız olarak eğitilmek üzere kullanması hangi tartışmayı doğurmuştur?",
        optionA: "Veri depolama kapasitesi sorunu",
        optionB: "Telif hakkı ihlali ve adil kullanım (fair use) tartışmaları",
        optionC: "Yazılım güncelleme sıklığı",
        optionD: "Kullanıcı arayüzü tasarımı",
        correctOption: "B",
        explanation: "Sanatçıların eserlerinin izin alınmadan, atıfta bulunulmadan ve telif ödenmeden yapay zekâ eğitiminde kullanılması günümüzün en büyük telif ve fikri mülkiyet tartışmalarından biridir.",
        category: "Telif Hakları",
        difficulty: "orta"
      },
      {
        questionText: "Bir yapay zekâ aracı tarafından tamamen insan müdahalesi olmadan üretilen bir görselin telif hakkı kime aittir?",
        optionA: "Görseli üreten yapay zekâ yazılımına",
        optionB: "Yapay zekayı kodlayan şirkete veya telif yasalarına göre kamu malı (public domain) kabul edilir",
        optionC: "Komutu (prompt) yazan kullanıcıya sınırsız fikri hak tanınır",
        optionD: "Görseli ilk gören kişiye",
        correctOption: "B",
        explanation: "Çoğu ülkede telif hakları yasaları yalnızca 'insan yaratıcılığını' korur. Tamamen yapay zekâ tarafından üretilen eserler genellikle kamu malı sayılır veya yazılımın lisans sözleşmesine tabi olur.",
        category: "Yasal Haklar",
        difficulty: "zor"
      }
    ];
  }

  if (lowercasePrompt.includes('gizlilik') || lowercasePrompt.includes('kvkk') || lowercasePrompt.includes('veri') || lowercasePrompt.includes('güvenlik')) {
    return [
      {
        questionText: "Üretken yapay zekâ sohbet robotlarını (ChatGPT, Gemini vb.) kullanırken kişisel bilgilerimizi veya şirket sırlarını paylaşmak neden risklidir?",
        optionA: "Yapay zekanın bu bilgileri anlayamaması ve hata vermesi nedeniyle",
        optionB: "Girdiğimiz verilerin modelin eğitimi için sunucularda saklanması ve ileride diğer kullanıcılara yanıt olarak sunulma riski nedeniyle",
        optionC: "İnternet kotamızın hızla tükenmesine yol açması nedeniyle",
        optionD: "Bilgisayarımıza virüs bulaşmasına sebep olabileceği için",
        correctOption: "B",
        explanation: "Sohbet robotlarına yazılan her girdi (prompt) genellikle sunucuya kaydedilir ve modeli geliştirmek için kullanılır. Bu yüzden hassas ve kişisel veriler asla girilmemelidir.",
        category: "Veri Güvenliği",
        difficulty: "orta"
      },
      {
        questionText: "Bir web sitesinin, bizim iznimiz olmadan yapay zekâ algoritmalarıyla tarama geçmişimizi analiz ederek bize özel reklamlar sunması hangi kavramla doğrudan ilişkilidir?",
        optionA: "Açık kaynak yazılım etiği",
        optionB: "Dijital gözetim, profil oluşturma ve veri gizliliği hakkı",
        optionC: "Yapay zekâ donanım gereksinimleri",
        optionD: "Veritabanı yedekleme protokolleri",
        correctOption: "B",
        explanation: "Kullanıcıların dijital ayak izlerinin izinsiz taranması, yapay zekâ modelleriyle analiz edilmesi gizlilik hakkının ihlali ve dijital gözetim sınırlarına girmektedir.",
        category: "Gizlilik",
        difficulty: "orta"
      }
    ];
  }

  // General fallback questions about AI Ethics & Literacy
  return [
    {
      questionText: "Yapay zekâ sistemlerinde 'algoritmik yanlılık' (bias) neyi ifade eder?",
      optionA: "Yapay zekanın insanlardan her zaman daha hızlı çalışmasını",
      optionB: "Eğitim verilerindeki önyargıların veya adaletsizliklerin yapay zekâ kararlarına yansıması durumunu",
      optionC: "Bilgisayar işlemcisinin aşırı ısınmasını",
      optionD: "Yapay zekanın sadece tek bir programlama diliyle yazılabilmesini",
      correctOption: "B",
      explanation: "Yapay zekâ beslendiği verilerle öğrenir. Eğer eğitim verileri ayrımcı veya dengesiz ise, yapay zekâ da yanlı ve adaletsiz kararlar vermeye başlar.",
      category: "Yapay Zekâ Etiği",
      difficulty: "orta"
    },
    {
      questionText: "Yapay zekanın kararlarını nasıl aldığının insanlar tarafından anlaşılabilir ve sorgulanabilir olması etik prensiplerden hangisiyle açıklanır?",
      optionA: "Gizlilik (Privacy)",
      optionB: "Açıklanabilirlik ve Şeffaflık (Explainability & Transparency)",
      optionC: "Hız ve Verimlilik (Speed & Efficiency)",
      optionD: "Otonomi (Autonomy)",
      correctOption: "B",
      explanation: "Şeffaflık ve açıklanabilirlik, yapay zekânın kara kutu gibi çalışmasını önleyerek hataların veya haksızlıkların denetlenebilmesini sağlar.",
      category: "Etik İlkeler",
      difficulty: "zor"
    },
    {
      questionText: "Yapay zekâyı hayatımıza entegre ederken göz önünde bulundurmamız gereken en temel etik yaklaşım ne olmalıdır?",
      optionA: "Yapay zekanın ne pahasına olursa olsun tüm insan işlerinin yerini almasını sağlamak",
      optionB: "İnsan odaklı, güvenilir, adil ve toplumsal fayda gözeten bir geliştirme ve kullanım süreci yürütmek",
      optionC: "Yalnızca en yüksek finansal kâr getirecek alanlara odaklanmak",
      optionD: "Yapay zekâ kararlarını sorgusuz sualsiz doğru kabul etmek",
      correctOption: "B",
      explanation: "Yapay zekâ etiğinin temel amacı, teknolojinin insan haklarına, güvenliğe ve evrensel değerlere saygılı bir biçimde insanlığın yararına kullanılmasıdır.",
      category: "Yapay Zekâ Okuryazarlığı",
      difficulty: "kolay"
    }
  ];
}

export default router;
