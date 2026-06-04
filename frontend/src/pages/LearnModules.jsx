import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, HelpCircle, Code, Eye, Search, Layers, Network, MessageSquare, Compass, ShieldAlert, Copyright, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LearnModules() {
  const [completedModules, setCompletedModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load completed modules from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedModules');
    if (saved) {
      setCompletedModules(JSON.parse(saved));
    }
  }, []);

  const toggleComplete = (id) => {
    let updated;
    if (completedModules.includes(id)) {
      updated = completedModules.filter(mId => mId !== id);
    } else {
      updated = [...completedModules, id];
    }
    setCompletedModules(updated);
    localStorage.setItem('completedModules', JSON.stringify(updated));
  };

  const modules = [
    {
      id: 'yz-nedir',
      title: 'Yapay Zekâ Nedir?',
      category: 'Temel',
      desc: 'İnsan zekasını taklit ederek veri analizi, problem çözme ve karar verme gibi süreçleri yerine getiren yazılımsal sistemler.',
      content: 'Yapay Zekâ (Artificial Intelligence - AI), bilgisayarların veya bilgisayar kontrolündeki robotların, genellikle insan zekasına özgü olan mantık yürütme, anlam çıkarma, genelleme ve geçmiş deneyimlerden öğrenme gibi zihinsel süreçleri taklit etmesini sağlayan bir teknolojidir. Yapay zekâ kendi başına yaşayan bir robot değil; karmaşık matematiksel formüller, algoritmalar ve devasa verilerle beslenen yazılımlardır.',
      example: 'Akıllı telefonlardaki sesli asistanlar (Siri, Google Asistan) veya Netflix’in izleme geçmişinize dayanarak size sunduğu film önerileri günlük yapay zekâ örnekleridir.',
      icon: <BrainIcon className="w-6 h-6 text-sky-400" />
    },
    {
      id: 'veri',
      title: 'Veri (Data)',
      category: 'Temel',
      desc: 'Yapay zekanın öğrenmesini, kalıpları tanımasını ve kararlar vermesini sağlayan en değerli dijital hammadde.',
      content: 'Veri, yapay zekânın "gıdasıdır". Metinler, fotoğraflar, ses kayıtları, internet üzerindeki aramalar ve tıklamalar gibi her türlü dijital iz birer veridir. Yapay zekâ modelleri, milyonlarca veriyi analiz ederek kalıplar ve örüntüler keşfeder. Veri ne kadar büyük, temiz ve çeşitli olursa, yapay zekânın performansı o derece yüksek olur.',
      example: 'Bir yapay zekanın "kedi" resmini tanıması için, ona önceden binlerce farklı kedi fotoğrafı (veri) gösterilerek kedinin kulak, burun ve göz yapısı öğretilir.',
      icon: <Code className="w-6 h-6 text-emerald-400" />
    },
    {
      id: 'algoritma',
      title: 'Algoritma',
      category: 'Temel',
      desc: 'Bir problemi çözmek veya belirli bir amaca ulaşmak için tasarlanan adım adım mantıksal işlem sırası.',
      content: 'Algoritma, bilgisayara bir işi nasıl yapacağını adım adım anlatan bir reçetedir. Girdiyi alıp, kurallar çerçevesinde işleyerek çıktıya dönüştürür. Yapay zekâ algoritmaları ise geleneksel algoritmalardan farklıdır; kod yazan kişinin kuralları elle girmesi yerine, veriden kuralları kendisinin çıkartması üzerine kurulmuştur.',
      example: 'Yemek tarifi bir algoritmadır: Malzemeleri hazırla -> Sebzeleri yıka -> Tencereye koy -> 20 dakika pişir -> Servis et.',
      icon: <Layers className="w-6 h-6 text-teal-400" />
    },
    {
      id: 'makine-ogrenmesi',
      title: 'Makine Öğrenmesi',
      category: 'Yapay Zekâ Dalları',
      desc: 'Sistemlerin açıkça programlanmadan, mevcut verileri analiz ederek tahmin yapmasını sağlayan teknoloji.',
      content: 'Makine Öğrenmesi (Machine Learning), bilgisayarların verilerden öğrenmesini ve edindiği tecrübelerle performansını iyileştirmesini sağlayan bir yapay zekâ yöntemidir. Bu yöntemde bilgisayara doğrudan kurallar verilmez; bunun yerine algoritma veriyi inceleyerek kendi kurallarını ve formüllerini otomatik olarak geliştirir.',
      example: 'E-postaların gelen kutusuna düşerken "Spam" (Gereksiz) veya "Güvenli" olarak otomatik sınıflandırılması, makine öğrenmesi modellerinin geçmiş spam e-postaları inceleyerek öğrendiği bir örüntüdür.',
      icon: <Compass className="w-6 h-6 text-indigo-400" />
    },
    {
      id: 'derin-ogrenme',
      title: 'Derin Öğrenme',
      category: 'Yapay Zekâ Dalları',
      desc: 'İnsan beynindeki sinir hücrelerinin yapısını taklit ederek çok katmanlı yapay sinir ağları ile öğrenme biçimi.',
      content: 'Derin Öğrenme (Deep Learning), insan beynindeki nöronların (sinir hücrelerinin) birbirine bağlanma şeklini taklit eden "Yapay Sinir Ağları" modeline dayanan bir makine öğrenmesi alt dalıdır. "Derin" kelimesi, verinin çok sayıda işlem katmanından (nöron katmanları) geçerek işlenmesini ifade eder. Ses tanıma, sürücüz araçlar ve yüz tanıma gibi çok karmaşık görevleri başarabilir.',
      example: 'Otonom (sürücüsüz) bir arabanın kameradan aldığı görüntüde yoldaki yayaları, trafik levhalarını ve şeritleri anlık olarak algılayıp fren kararı vermesi derin öğrenme ile sağlanır.',
      icon: <Network className="w-6 h-6 text-violet-400" />
    },
    {
      id: 'uretken-yz',
      title: 'Üretken Yapay Zekâ',
      category: 'Teknoloji',
      desc: 'Mevcut verilerden öğrenerek tamamen yeni metinler, resimler, kodlar, müzikler veya videolar üretebilen modeller.',
      content: 'Üretken Yapay Zekâ (Generative AI), var olan verileri analiz ederek analiz ettiği kalıplara benzeyen ama tamamen yeni ve orijinal içerikler üretebilen yapay zekâ teknolojisidir. Büyük dil modelleri (LLM) ve difüzyon modelleri bu sınıfın en bilinen temsilcileridir.',
      example: 'Sadece "Güneş gözlüğü takan astronot kedinin yağlı boya tablosu" yazarak anında sıfırdan dijital bir resim oluşturmak üretken yapay zekâ çalışmasıdır.',
      icon: <HelpCircle className="w-6 h-6 text-pink-400" />
    },
    {
      id: 'chatgpt',
      title: 'ChatGPT',
      category: 'Yapay Zekâ Araçları',
      desc: 'OpenAI tarafından geliştirilen, insan benzeri diyaloglar kurabilen ve metin tabanlı zengin çıktılar üreten asistan.',
      content: 'ChatGPT, OpenAI firması tarafından geliştirilen, internetteki devasa metin verileriyle eğitilmiş bir yapay zekâ sohbet robotudur. GPT (Generative Pre-trained Transformer) mimarisini kullanır. Sorulara cevap verebilir, makale yazabilir, yazılım kodlarındaki hataları bulabilir ve yaratıcı fikirler sunabilir.',
      example: 'Bir tarih ödevi için "Lale Devri’ni anlatan kısa bir özet yaz" komutuna saniyeler içinde akıcı bir Türkçe makale üretmesi.',
      icon: <MessageSquare className="w-6 h-6 text-emerald-500" />
    },
    {
      id: 'gemini',
      title: 'Gemini',
      category: 'Yapay Zekâ Araçları',
      desc: 'Google tarafından geliştirilen; metin, ses, görüntü ve kodu aynı anda anlayabilen güçlü çoklu modlu (multimodal) yapay zekâ.',
      content: 'Gemini, Google tarafından sıfırdan çoklu modlu (multimodal) olarak tasarlanmış yapay zekâ modelidir. Bu, Gemini’ın sadece metinleri değil; aynı anda görselleri, sesleri, videoları ve bilgisayar kodlarını doğrudan anlayıp harmanlayabileceği anlamına gelir. Son derece güçlü akıl yürütme yeteneğine sahiptir.',
      example: 'Gemini’a karmakarışık bir matematik sorusunun fotoğrafını yükleyip "Bunu bana adım adım çözerek anlat" dediğinizde görseli okuyup çözümü metin olarak yazabilmesi.',
      icon: <SparklesIcon className="w-6 h-6 text-sky-500" />
    },
    {
      id: 'claude',
      title: 'Claude',
      category: 'Yapay Zekâ Araçları',
      desc: 'Anthropic firması tarafından güvenlik ve insan değerlerine uyumluluk önceliğiyle geliştirilen yapay zekâ modeli.',
      content: 'Claude, Anthropic tarafından geliştirilen ve "Anayasal Yapay Zekâ" (Constitutional AI) adı verilen bir güvenlik sistemiyle eğitilmiş sohbet robotudur. Uzun belgeleri okuma, karmaşık analizler yapma, temiz kod yazma ve kullanıcıyla saygılı, objektif diyaloglar sürdürme konularında çok başarılıdır.',
      example: '100 sayfalık bir PDF kitabını Claude’a yükleyip "Bu kitaptaki en önemli 5 ana fikri maddeler halinde çıkar" dediğinizde hızlıca analiz etmesi.',
      icon: <MessageSquare className="w-6 h-6 text-orange-400" />
    },
    {
      id: 'copilot',
      title: 'Copilot',
      category: 'Yapay Zekâ Araçları',
      desc: 'Microsoft ve GitHub ortaklığıyla, kod yazma ve ofis işlerinde kullanıcılara yardımcı olan yapay zekâ asistanı.',
      content: 'Copilot, Microsoft’un Windows, Office programları (Word, Excel vb.) ve kod editörlerine entegre ettiği yapay zekâ asistanıdır. Özellikle yazılımcılar için kod tamamlama ve otomatik kod üretme yetenekleriyle bilinir; ofis çalışanları için ise e-posta özetleme ve sunum hazırlama işlerini hızlandırır.',
      example: 'Yazılım geliştirirken `// Kullanıcının yaşını kontrol eden fonksiyon` yazmaya başladığınızda Copilot’un fonksiyon kodunu otomatik olarak önermesi.',
      icon: <Code className="w-6 h-6 text-indigo-500" />
    },
    {
      id: 'deepfake',
      title: 'Deepfake',
      category: 'Riskler & Etik',
      desc: 'Yapay zekâ algoritmalarıyla bir kişinin yüzünü veya sesini başka bir videoya gerçekçi şekilde monte etme yöntemi.',
      content: 'Deepfake, derin öğrenme algoritmaları kullanılarak, hedef kişinin sesinin, yüz mimiklerinin ve beden hareketlerinin manipüle edilip sahte video veya ses kayıtları oluşturulması teknolojisidir. Eğlence sektöründe (örneğin sinemada gençleştirme) faydalı olabilse de, dolandırıcılık, sahte haber yayma ve kişisel itibar zedeleme gibi çok ciddi tehditler oluşturur.',
      example: 'Tanınmış bir devlet yöneticisinin gerçekte söylemediği sözleri söylüyormuş gibi gösteren, dudak hareketleri ve sesi birebir taklit edilmiş sahte sosyal medya videoları.',
      icon: <ShieldAlert className="w-6 h-6 text-red-400" />
    },
    {
      id: 'veri-guvenligi',
      title: 'Veri Güvenliği',
      category: 'Riskler & Etik',
      desc: 'Yapay zekâ araçlarını kullanırken paylaşılan kişisel verilerin korunması ve gizliliğinin sağlanması süreci.',
      content: 'Veri Güvenliği, yapay zekâ araçlarıyla etkileşime girerken paylaştığımız bilgilerin başkalarının eline geçmesini engellemektir. Sohbet robotlarına yazdığımız promptlar, yüklediğimiz dosyalar ve fotoğraflar sunucularda saklanır ve modelleri eğitmek için incelenebilir. Hassas bilgilerin korunması siber güvenlik açısından şarttır.',
      example: 'Yazılım geliştirirken şirket sırrı olan kodları veya bir ödev yaparken ailenizin T.C. kimlik numaralarını, banka bilgilerini yapay zekaya sormamak ve girmemek.',
      icon: <Shield className="w-6 h-6 text-sky-400" />
    },
    {
      id: 'telif-haklari',
      title: 'Telif Hakları',
      category: 'Riskler & Etik',
      desc: 'Yapay zekânın başkalarına ait eserlerle eğitilmesi ve üretilen çıktıların sahipliği hakkındaki yasal tartışmalar.',
      content: 'Yapay zekâ modelleri internetteki telifli sanat eserleri, makaleler ve kitaplarla eğitilir. Bu durum, "Sanatçıların emekleri çalınıyor mu?" sorusunu doğurur. Ayrıca, yapay zekânın ürettiği bir görselin veya metnin yasal sahibinin kim olduğu (kullanıcı mı, yazılımı üreten firma mı, yoksa yapay zekanın kendisi mi) henüz tam çözülmemiş büyük bir hukuksal konudur.',
      example: 'Yapay zekâ tarafından ünlü bir ressamın tarzında üretilen bir tablonun satılması durumunda, orijinal ressamın ailesinin açtığı hak davaları.',
      icon: <Copyright className="w-6 h-6 text-amber-500" />
    },
    {
      id: 'etik-kullanim',
      title: 'Etik Kullanım',
      category: 'Riskler & Etik',
      desc: 'Yapay zekâyı başkalarına zarar vermeyecek, dürüst ve akademik ahlaka uygun şekilde kullanma ilkeleri.',
      content: 'Yapay zekâ etiği, bu güçlü teknolojiyi insanlığa faydalı, adil ve zararsız şekilde kullanma kılavuzudur. Akademik dürüstlük (ödevleri tamamen robota yaptırmamak), şeffaflık (yapay zekâ kullandığını saklamamak), tarafsızlık (ayrımcı sonuçlardan kaçınmak) ve bireysel haklara saygı etik kullanımın temel direkleridir.',
      example: 'Bir proje hazırlarken araştırmada yapay zekâ kullandığını "Kaynaklar" bölümünde dürüstçe belirtmek ve yapay zekanın verdiği bilgileri doğrulamak.',
      icon: <BookOpen className="w-6 h-6 text-teal-400" />
    }
  ];

  const filteredModules = modules.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Hepsi', 'Temel', 'Yapay Zekâ Dalları', 'Yapay Zekâ Araçları', 'Riskler & Etik'];
  const [activeCategory, setActiveCategory] = useState('Hepsi');

  const displayedModules = filteredModules.filter(m =>
    activeCategory === 'Hepsi' || m.category === activeCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Background glow */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-sky-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <BookOpen className="text-sky-400" />
          Yapay Zekâ Öğrenme Modülleri
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Yapay zekâ teknolojilerini tanı, etik kullanım kurallarını öğren ve geleceğin okuryazarı ol.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Modül ara (Örn: Derin öğrenme, Telif...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border cursor-pointer ${
                activeCategory === cat
                  ? 'bg-sky-500/25 border-sky-400 text-sky-400 shadow-md shadow-sky-500/10'
                  : 'bg-white/5 border-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Stats bar */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <CheckCircle2 className="text-emerald-400" size={18} />
          İlerleme Durumu:
          <span className="text-sky-400">{completedModules.length} / {modules.length} Modül</span>
        </div>
        <div className="flex-1 max-w-md bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedModules.length / modules.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Modules Cards Grid */}
      {displayedModules.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Aradığınız kritere uygun modül bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedModules.map((m) => {
            const isCompleted = completedModules.includes(m.id);

            return (
              <div
                key={m.id}
                className={`p-6 rounded-2xl glass-card flex flex-col justify-between relative group ${
                  isCompleted ? 'border-emerald-500/20' : 'border-white/5'
                }`}
              >
                {/* Completion indicator */}
                {isCompleted && (
                  <div className="absolute top-4 right-4 text-emerald-400">
                    <CheckCircle2 size={18} fill="rgba(16,185,129,0.1)" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                      {m.icon}
                    </div>
                    <div>
                      <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-sky-500/10">
                        {m.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 mt-1 leading-snug">{m.title}</h3>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">
                    {m.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-4 mt-2">
                  <button
                    onClick={() => toggleComplete(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {isCompleted ? 'Tamamlandı' : 'Tamamla'}
                  </button>

                  <button
                    onClick={() => setSelectedModule(m)}
                    className="px-3 py-1.5 glass-button text-xs text-sky-300 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    Detayları Oku
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Module Reader Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-panel border border-white/10 p-6 sm:p-8 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scaleUp">
            <span className="text-xs text-sky-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10">
              {selectedModule.category}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-100 mt-2 mb-4">
              {selectedModule.title}
            </h3>

            {/* Content */}
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-light">
              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wide text-xs mb-1.5">Konu Anlatımı</h4>
                <p className="bg-white/5 border border-white/5 p-4 rounded-xl">
                  {selectedModule.content}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 uppercase tracking-wide text-xs mb-1.5">Günlük Hayattan Örnek</h4>
                <p className="bg-sky-500/5 border border-sky-500/10 p-4 rounded-xl text-sky-300">
                  {selectedModule.example}
                </p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 border-t border-white/5 pt-6">
              <button
                onClick={() => {
                  toggleComplete(selectedModule.id);
                }}
                className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                  completedModules.includes(selectedModule.id)
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <CheckCircle2 size={16} />
                {completedModules.includes(selectedModule.id) ? 'Tamamlandı Olarak İşaretlendi' : 'Tamamlandı Olarak İşaretle'}
              </button>

              <button
                onClick={() => setSelectedModule(null)}
                className="py-2.5 px-6 bg-gradient-to-r from-sky-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Kapat ve Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon fallbacks
function BrainIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function SparklesIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
