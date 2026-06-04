import React from 'react';
import { BookOpen, MessageSquare, Award, BrainCircuit, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing({ setActivePage }) {
  const { user } = useAuth();

  const handleCardClick = (targetPage) => {
    if (user) {
      if (user.role === 'admin') {
        setActivePage('admin-dashboard');
      } else {
        setActivePage(targetPage);
      }
    } else {
      setActivePage('register');
    }
  };

  const modules = [
    {
      id: 'learn',
      title: 'Öğrenme Modülleri',
      desc: 'Yapay zekâ nedir, derin öğrenme, üretken araçlar, siber güvenlik, telif hakları ve etik kullanım prensiplerini görsel zengin içeriklerle öğren.',
      icon: <BookOpen className="w-8 h-8 text-sky-400" />,
      color: 'from-sky-500/20 to-sky-400/5',
      borderColor: 'border-sky-500/25'
    },
    {
      id: 'guide',
      title: 'AI Rehber',
      desc: 'Yapay zekâ teknolojileri hakkında aklına takılan her soruyu lise düzeyinde cevaplayan, etik kurallara bağlı akıllı Gemini sohbet robotu.',
      icon: <MessageSquare className="w-8 h-8 text-teal-400" />,
      color: 'from-teal-500/20 to-teal-400/5',
      borderColor: 'border-teal-500/25'
    },
    {
      id: 'quiz',
      title: 'Akıllı Quiz',
      desc: 'Senaryo tabanlı ve çoktan seçmeli karma sorulardan oluşan testleri çöz. Gemini AI anında geri bildirimler versin ve başarı durumuna göre rozetler kazan.',
      icon: <Award className="w-8 h-8 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-400/5',
      borderColor: 'border-emerald-500/25'
    },
    {
      id: 'scenarios',
      title: 'Senaryo Merkezi',
      desc: 'Gündelik hayattan etik ikilemlere dayalı senaryolara kendi kelimelerinle cevap yaz. Yapay zekâ yanıtlarını etik açıdan değerlendirsin ve puanlasın.',
      icon: <BrainCircuit className="w-8 h-8 text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-400/5',
      borderColor: 'border-indigo-500/25'
    }
  ];

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none pulse-glow"></div>
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none pulse-glow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-semibold text-sky-300 mb-6 tracking-wider uppercase animate-pulse">
          <Sparkles size={12} />
          Lise Öğrencileri İçin Geleceğin Eğitimi
        </div>

        {/* Hero Headings */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Yapay Zekâyı{' '}
          <span className="bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Tanı, Sorgula
          </span>{' '}
          ve Bilinçli Kullan
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Yapay zekâ okuryazarlığını geliştir, etik kullanım ilkelerini öğren ve kendini test et. 
          Geleceğin teknolojisine bugünden bilinçli adımlar at.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          {user ? (
            <button
              onClick={() => setActivePage(user.role === 'admin' ? 'admin-dashboard' : 'dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Paneline Git
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <>
              <button
                onClick={() => setActivePage('register')}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                Hemen Ücretsiz Başla
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setActivePage('login')}
                className="w-full sm:w-auto px-8 py-4 glass-button text-slate-200 font-semibold rounded-xl transition-all cursor-pointer"
              >
                Giriş Yap
              </button>
            </>
          )}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto mb-24">
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => handleCardClick(m.id)}
              className={`p-6 rounded-2xl border ${m.borderColor} bg-gradient-to-br ${m.color} glass-card cursor-pointer group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 blur-2xl group-hover:bg-white/10 transition-all"></div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                  {m.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-white flex items-center gap-1.5">
                    {m.title}
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {m.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features banner */}
        <div className="max-w-5xl mx-auto border-t border-white/10 pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 mb-3">
              <ShieldCheck size={24} />
            </div>
            <h4 className="font-semibold text-slate-200 mb-1">Veri Güvenliği Bilinci</h4>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Kişisel bilgilerinizin yapay zekâ araçlarında nasıl korunacağını ve güvenli paylaşım ilkelerini öğrenin.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 mb-3">
              <BrainCircuit size={24} />
            </div>
            <h4 className="font-semibold text-slate-200 mb-1">Etik Değerlendirme</h4>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Günlük hayattaki yapay zekâ uygulamalarının etik sınırlarını analiz edin ve puan alın.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mb-3">
              <AlertCircle size={24} />
            </div>
            <h4 className="font-semibold text-slate-200 mb-1">Deepfake & Telif Hakları</h4>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Sahte içerikleri ayırt etme teknikleri geliştirin ve fikri mülkiyet tartışmalarını kavrayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
