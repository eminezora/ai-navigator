import React, { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, BookOpen, Send, ShieldCheck, AlertCircle, Compass, HelpCircle, Star } from 'lucide-react';

export default function ScenarioCenter() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [response, setResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    {
      id: 1,
      title: 'Kolay Yol: Ödevimi Robota Yazdırmak',
      text: 'Bir lise öğrencisi, teslim etmesi gereken performans ödevinin tamamını ChatGPT\'ye yazdırıyor ve üzerinde hiçbir değişiklik yapmadan kendi çalışması gibi öğretmenine teslim ediyor. Sizce bu davranış etik midir? Bu durumun öğrencinin kişisel gelişimine ve eğitimine olası zararları nelerdir?',
      tags: ['Akademik Dürüstlük', 'Özgünlük']
    },
    {
      id: 2,
      title: 'Sahte Gerçeklik: Sosyal Medyada Deepfake',
      text: 'Sosyal medyada çok popüler bir kişinin veya siyasetçinin, gerçekte söylemediği skandal sözleri sarf ettiği, dudak hareketleri ve sesiyle birebir uyuşan sahte bir video (deepfake) yayılıyor. Bu videoyu gören bir genç olarak nasıl davranmalısınız? Bu teknolojinin kötüye kullanımının toplumsal riskleri nelerdir?',
      tags: ['Deepfake', 'Bilgi Kirliliği']
    },
    {
      id: 3,
      title: 'Gizlilik İhlali: Kişisel Bilgi Paylaşımı',
      text: 'Bir öğrenci yapay zekâ aracıyla sohbet ederken, kendi okul numarasını, tam adını, ev adresini ve velisinin e-devlet şifrelerini girerek sorular sormaya devam ediyor. Yapay zekanın bu verileri saklama politikası düşünüldüğünde, bu davranış ne gibi güvenlik riskleri yaratır?',
      tags: ['Veri Güvenliği', 'Gizlilik']
    },
    {
      id: 4,
      title: 'Güven Sorunu: Yapay Zekânın Halüsinasyonu',
      text: 'Bir öğrenci coğrafya projesi için yapay zekâ aracından aldığı istatistiki bilgileri doğrulamadan doğrudan slaytına ekliyor. Sunum esnasında bu bilgilerin tamamen uydurma (yapay zekâ halüsinasyonu) olduğu ortaya çıkıyor. Yapay zekâ çıktılarına güven sınırımız ne olmalıdır?',
      tags: ['Halüsinasyon', 'Doğrulama']
    },
    {
      id: 5,
      title: 'Dijital Akran Zorbalığı: Fotoğraf Değiştirme',
      text: 'Bir öğrenci şaka amaçlı olarak sınıf arkadaşının fotoğrafını internetteki yapay zekâ araçlarıyla komik ama küçük düşürücü bir görsele dönüştürüyor ve arkadaş grubunda paylaşıyor. Bu durum hangi kişisel hakların ihlalidir ve etik açıdan nasıl değerlendirilmelidir?',
      tags: ['Akran Zorbalığı', 'Kişisel Haklar']
    }
  ];

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!response.trim()) return;

    setLoading(true);
    setEvaluation(null);

    try {
      const res = await axios.post('/api/ai/evaluate-scenario', {
        scenarioId: selectedScenario.id,
        scenarioText: selectedScenario.text,
        userResponse: response
      });

      setEvaluation(res.data);
    } catch (error) {
      console.error('Error evaluating scenario:', error);
      // Fallback details if server/API has errors
      setEvaluation({
        ethicalCompliance: 'Değerlendirme servisine bağlanılamadı ancak dürüst yaklaşımların daima etik olduğunu unutmamak önemlidir.',
        gaps: 'Yapay zekanın veri gizliliği ve yasal sorumluluk boyutları biraz daha açılabilirdi.',
        recommendations: 'Yapay zekâ etiği hakkındaki öğrenme modüllerini tekrar okuyup kendinizi geliştirebilirsiniz.',
        score: 75
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedScenario(null);
    setResponse('');
    setEvaluation(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none pulse-glow"></div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <BrainCircuit className="text-indigo-400" />
          Etik Senaryo Değerlendirme Merkezi
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerçek hayattaki etik açmazları oku, kendi yorumunu yaz ve yapay zekânın yapıcı değerlendirmesini al.
        </p>
      </div>

      {!selectedScenario ? (
        /* LIST OF SCENARIOS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scen) => (
            <div key={scen.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between border border-white/5">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {scen.tags.map((t, i) => (
                    <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{scen.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light line-clamp-3">
                  {scen.text}
                </p>
              </div>
              <button
                onClick={() => setSelectedScenario(scen)}
                className="mt-6 w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Senaryoyu Yanıtla
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* SELECTED SCENARIO WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start animate-fadeIn">
          {/* Left / Middle: Scenario & Input Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Scenario Card */}
            <div className="p-6 rounded-2xl glass-panel border-white/10">
              <button
                onClick={handleBackToList}
                className="text-xs text-indigo-400 hover:underline mb-4 inline-block font-semibold"
              >
                ← Senaryo Listesine Dön
              </button>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{selectedScenario.title}</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light bg-white/5 p-4 rounded-xl">
                {selectedScenario.text}
              </p>
            </div>

            {/* Answer Input */}
            <div className="p-6 rounded-2xl glass-panel border-white/10">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Senin Görüşün ve Çözümün</h4>
              <form onSubmit={handleEvaluate} className="space-y-4">
                <textarea
                  rows="6"
                  required
                  placeholder="Bu durumu etik açıdan nasıl değerlendiriyorsun? Sence yapılması gereken en doğru davranış nedir? Görüşünü detaylıca (en az birkaç cümle ile) açıkla..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full p-4 rounded-xl glass-input text-sm focus:outline-none focus:border-indigo-500"
                ></textarea>

                <button
                  type="submit"
                  disabled={loading || !response.trim()}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:brightness-110 disabled:brightness-75 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Send size={16} />
                      Yorumumu AI Etiği Uzmanına Gönder
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Evaluation Results */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="glass-panel p-8 rounded-2xl border-white/10 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
                  <BrainCircuit className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
                </div>
                <h4 className="text-slate-200 font-bold">Yapay Zekâ Analiz Ediyor...</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                  Cevabınız Gemini API üzerinden etik bilinci, siber güvenlik riskleri ve çözüm kalitesi açısından değerlendiriliyor.
                </p>
              </div>
            )}

            {evaluation && (
              <div className="glass-panel p-6 rounded-2xl border-white/10 space-y-6 animate-scaleUp">
                {/* Score Widget */}
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Etik Bilinç Skoru</span>
                  <div className="relative flex items-center justify-center mt-3">
                    {/* SVG Progress Circle */}
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#818cf8" strokeWidth="8" fill="transparent"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - evaluation.score / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-extrabold text-slate-100">{evaluation.score}</span>
                      <span className="text-[10px] text-slate-400 font-bold">/100</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5">
                    <Star className="text-amber-400 fill-amber-400" size={14} />
                    <span className="text-xs font-semibold text-indigo-300">
                      {evaluation.score >= 80 ? 'Üstün Etik Farkındalık' : evaluation.score >= 50 ? 'Gelişmekte Olan Bilinç' : 'Düşük Farkındalık'}
                    </span>
                  </div>
                </div>

                {/* Compliance */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={14} />
                    Etik Uygunluk
                  </h5>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {evaluation.ethicalCompliance}
                  </p>
                </div>

                {/* Gaps */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle size={14} />
                    Eksik Yönler
                  </h5>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {evaluation.gaps}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="space-y-1.5">
                  <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <Compass size={14} />
                    Öneriler
                  </h5>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {evaluation.recommendations}
                  </p>
                </div>

                <button
                  onClick={handleBackToList}
                  className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Tamamlandı, Diğer Senaryoya Geç
                </button>
              </div>
            )}

            {!loading && !evaluation && (
              <div className="glass-panel p-8 rounded-2xl border-white/10 text-center flex flex-col items-center justify-center min-h-[300px] border-dashed border-2">
                <HelpCircle size={32} className="text-slate-500 mb-3" />
                <h4 className="text-slate-300 font-bold text-sm">Değerlendirme Hazır Değil</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                  Senaryoyu okuyup soldaki forma kendi yorumunuzu yazdıktan sonra "Yorumumu AI Etiği Uzmanına Gönder" butonuna basın.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
